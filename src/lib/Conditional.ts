import { get, writable } from 'svelte/store';
import type { Section, Condition } from '$lib/Types';
import type { HassEntities } from 'home-assistant-js-websocket';

/**
 * Checks every section in a view
 * Runs whenever paramerers changes
 */
export function handleVisibility($editMode: boolean, sections: Section[], states: HassEntities) {
	const viewSections: Section[] = [];

	sections.forEach((section: Section) => {
		if (handleAllConditions($editMode, states, section)) {
			// horizontal-stack / vertical-stack
			if (
				(section.type === 'horizontal-stack' || section.type === 'vertical-stack') &&
				section.sections
			) {
				const stack = section.sections.filter((nested: Section) => {
					return handleAllConditions($editMode, states, nested);
				});

				if (stack.length > 0) {
					section = { ...section, sections: stack };
					viewSections.push(section);
				}
			} else {
				// section
				viewSections.push(section);
			}
		}
	});
	return viewSections;
}

/**
 * Filters items based on their visibility conditions.
 * Supports per-item visibility and section-level item_visibility_template.
 */
export function handleItemVisibility(
	$editMode: boolean,
	items: any[],
	states: HassEntities,
	section?: any
) {
	if (!items) return [];

	return items.filter((item: any) => {
		if (section?.item_visibility_template && item?.entity_id) {
			const templateConditions = applyItemVisibilityTemplate(item, section.item_visibility_template);
			if (templateConditions) {
				const meetsTemplate = templateConditions.every((condition: any) =>
					validateConditionForItem($editMode, states, item, condition)
				);
				if (item?.visibility) {
					return meetsTemplate && handleAllConditionsForItem($editMode, states, item);
				}
				return meetsTemplate;
			}
		}
		return handleAllConditionsForItem($editMode, states, item);
	});
}

function applyItemVisibilityTemplate(
	item: any,
	template: { conditions?: Condition[] }[]
): { conditions?: Condition[] }[] | null {
	if (!item?.entity_id || !template) return null;
	const processed = JSON.parse(JSON.stringify(template));
	const replacePlaceholder = (obj: any): void => {
		if (!obj || typeof obj !== 'object') return;
		for (const key in obj) {
			if (key === 'entity' && obj[key] === '{item.entity_id}') {
				obj[key] = item.entity_id;
			} else if (typeof obj[key] === 'object') {
				replacePlaceholder(obj[key]);
			}
		}
	};
	replacePlaceholder(processed);
	return processed;
}

export function handleAllConditionsForItem($editMode: boolean, $states: HassEntities, item: any) {
	if (!$states || !item?.visibility) return true;
	return item.visibility.every((condition: any) =>
		validateConditionForItem($editMode, $states, item, condition)
	);
}

export function validateConditionForItem(
	$editMode: boolean,
	$states: HassEntities,
	item: any,
	condition: Condition
): boolean {
	switch (condition?.condition) {
		case 'and':
			return handleAndForItem($editMode, $states, item, condition);
		case 'or':
			return handleOrForItem($editMode, $states, item, condition);
		case 'state':
			return handleState($states, condition);
		case 'numeric_state':
			return handleNumericState($states, condition);
		case 'screen':
			return handleScreenForItem($editMode, item, condition);
		default:
			return false;
	}
}

export function handleAndForItem(
	$editMode: boolean,
	$states: HassEntities,
	item: any,
	condition: Condition
) {
	if (!condition.conditions?.length) return false;
	return (
		condition.conditions?.every((subCondition: Condition) =>
			validateConditionForItem($editMode, $states, item, subCondition)
		) ?? false
	);
}

export function handleOrForItem(
	$editMode: boolean,
	$states: HassEntities,
	item: any,
	condition: Condition
) {
	if (!condition.conditions?.length) return false;
	return (
		condition.conditions?.some((subCondition: Condition) =>
			validateConditionForItem($editMode, $states, item, subCondition)
		) ?? false
	);
}

export function handleScreenForItem($editMode: boolean, item: any, conditions: Condition) {
	const id = item?.id;
	if (!id || !conditions?.media_query) return false;

	if ($editMode) {
		return window?.matchMedia(conditions?.media_query)?.matches;
	}

	const store = get(mediaQueries);
	const prev = store?.[id];
	if (prev?.mql && prev?.listener) {
		prev?.mql?.removeEventListener('change', prev?.listener);
		delete prev?.listener;
	}

	const mql = window?.matchMedia(conditions?.media_query);
	const listener = () => {
		mediaQueries?.update((mqs: any) => ({
			...mqs,
			[id]: { ...mqs?.[id], matches: mql?.matches }
		}));
	};
	mql?.addEventListener('change', listener);
	mediaQueries?.update((mqs: any) => ({
		...mqs,
		[id]: { mql, listener, matches: mql?.matches }
	}));

	return mql?.matches;
}

/**
 * Handles every section in handleVisibility
 */
export function handleAllConditions($editMode: boolean, $states: HassEntities, section: Section) {
	// early return if no states or visibility array
	if (!$states || !section?.visibility) return true;

	return section.visibility.every((condition) =>
		validateCondition($editMode, $states, section, condition)
	);
}

/**
 * Validates every condition in handleAllConditions
 */
export function validateCondition(
	$editMode: boolean,
	$states: HassEntities,
	section: Section,
	condition: Condition
): boolean {
	switch (condition?.condition) {
		case 'and':
			return handleAnd($editMode, $states, section, condition);
		case 'or':
			return handleOr($editMode, $states, section, condition);
		case 'state':
			return handleState($states, condition);
		case 'numeric_state':
			return handleNumericState($states, condition);
		case 'screen':
			return handleScreen($editMode, section, condition);
		default:
			return false;
	}
}

/**
 * State
 */
export function handleState($states: HassEntities, conditions: Condition) {
	if (!conditions?.entity || !$states?.[conditions?.entity]) return false;
	const entityState = $states?.[conditions?.entity]?.state;

	if (typeof conditions?.state !== 'undefined' && conditions?.state !== '') {
		return entityState === conditions?.state;
	} else if (typeof conditions?.state_not !== 'undefined' && conditions?.state_not !== '') {
		return entityState !== conditions?.state_not;
	} else {
		return false;
	}
}

/**
 * Numeric
 */
export function handleNumericState($states: HassEntities, conditions: Condition) {
	if (!conditions?.entity || !$states?.[conditions?.entity]) return false;

	const entityState = parseFloat($states?.[conditions?.entity]?.state);

	if (isNaN(entityState)) {
		return false;
	} else if (typeof conditions?.above === 'number' && typeof conditions?.below === 'number') {
		return entityState > conditions?.above && entityState < conditions?.below;
	} else if (typeof conditions?.above === 'number') {
		return entityState > conditions?.above;
	} else if (typeof conditions?.below === 'number') {
		return entityState < conditions?.below;
	} else {
		return false;
	}
}

/**
 * And
 */
export function handleAnd(
	$editMode: boolean,
	$states: HassEntities,
	section: Section,
	condition: Condition
) {
	if (!condition.conditions?.length) return false;

	return (
		condition.conditions?.every((subCondition) =>
			validateCondition($editMode, $states, section, subCondition)
		) ?? false
	);
}

/**
 * Or
 */
export function handleOr(
	$editMode: boolean,
	$states: HassEntities,
	section: Section,
	condition: Condition
) {
	if (!condition.conditions?.length) return false;

	return (
		condition.conditions?.some((subCondition) =>
			validateCondition($editMode, $states, section, subCondition)
		) ?? false
	);
}

/**
 * Screen
 */

interface mediaQueries {
	[key: string]: {
		mql: MediaQueryList;
		matches: boolean;
		listener?: () => void;
	};
}

export const mediaQueries = writable<mediaQueries>({});

export function handleScreen($editMode: boolean, section: Section, conditions: Condition) {
	const id = section?.id;
	if (!id || !conditions?.media_query) return false;

	// prevent infinite loop
	if ($editMode) {
		return window?.matchMedia(conditions?.media_query)?.matches;
	}

	const store = get(mediaQueries);

	// cleanup
	const prev = store?.[id];
	if (prev?.mql && prev?.listener) {
		prev?.mql?.removeEventListener('change', prev?.listener);
		delete prev?.listener;
	}

	const mql = window?.matchMedia(conditions?.media_query);

	const listener = () => {
		mediaQueries?.update((mqs) => ({
			...mqs,
			[id]: { ...mqs?.[id], matches: mql?.matches }
		}));
	};

	mql?.addEventListener('change', listener);

	mediaQueries?.update((mqs) => {
		return {
			...mqs,
			[id]: { mql, listener, matches: mql?.matches }
		};
	});

	return mql?.matches;
}
