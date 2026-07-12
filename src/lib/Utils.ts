import type { HassEntity } from 'home-assistant-js-websocket';
import type { Dashboard, Section } from '$lib/Types';

/**
 * Updates a selected object's property based on the event or direct value.
 * If no value is provided, the specified property is deleted from the object.
 */
export function updateObj(sel: any, key: string, event?: any) {
	if (event?.type) {
		// select or input
		sel[key] = event.detail || event.target?.value;
	} else if (event !== undefined) {
		// direct value
		sel[key] = event;
	} else {
		delete sel[key];
	}
	return sel;
}

/**
 * Retrieves a selected item by its ID from the given dashboard data.
 * It first searches within the sidebar, then the views sections
 */
export function getSelected(id: number | undefined, data: Dashboard) {
	if (data.sidebar) {
		const sidebarItem = data.sidebar.find((item) => item.id === id);
		if (sidebarItem) return sidebarItem;
	}

	if (data.views) {
		for (const view of data.views) {
			if (view.sections) {
				const result = findInSections(view.sections, id);
				if (result) return result;
			}
		}
	}

	return undefined;
}

function findInSections(sections: Section[], id: number | undefined): any {
	for (const section of sections) {
		if (section.items) {
			for (const item of section.items) {
				if (item.id === id) return item;
			}
		}
		if (section.type === 'horizontal-stack' && section.sections) {
			const result = findInSections(section.sections, id);
			if (result) return result;
		}
	}
	return undefined;
}

/**
 * Returns the domain from a given entity_id
 * @example domain("light.bedroom") // "light"
 */
export function getDomain(entity_id: string | undefined) {
	return entity_id?.split('.')?.[0];
}

/**
 * Returns the name of a given entity
 * name | friendly_name | entity_id
 */
export function getName(
	sel: any | undefined,
	entity: HassEntity | undefined,
	sectionName: string | undefined = undefined
) {
	const name = sel?.name || entity?.attributes?.friendly_name || entity?.entity_id?.split('.')?.[1];
	return !sel?.name && sectionName && name?.startsWith(sectionName + ' ')
		? name?.substring(sectionName?.length + 1)
		: name;
}

/**
 * Returns togglable service
 */
export function getTogglableService(entity: HassEntity) {
	const domain = getDomain(entity?.entity_id);
	const state = entity?.state;

	if (!domain || !state) return;

	let service;

	switch (domain) {
		case 'automation':
		case 'button':
		case 'cover':
		case 'fan':
		case 'humidifier':
		case 'input_boolean':
		case 'light':
		case 'media_player':
		case 'script':
		case 'siren':
		case 'switch':
			service = 'toggle';
			break;

		case 'input_button':
			service = 'press';
			break;

		case 'lock':
			service = state === 'locked' ? 'unlock' : 'lock';
			break;

		case 'remote':
			return 'homeassistant.toggle';

		case 'group':
			service = state === 'off' ? 'turn_on' : 'turn_off';
			return `homeassistant.${service}`;

		case 'scene':
			service = 'turn_on';
			break;

		case 'timer':
			service = state === 'active' ? 'cancel' : 'start';
			break;

		case 'vacuum':
			service = state === 'cleaning' ? 'pause' : 'start';
			break;
	}

	if (service) {
		return `${domain}.${service}`;
	}
}

/**
 * Generates a unique 13-digit random ID
 * that doesn't collide with existing IDs
 */
export function generateId(data: Dashboard) {
	const ids = new Set();

	// add ids
	for (const item of data.sidebar) {
		ids.add(item.id);
	}

	for (const view of data.views) {
		ids.add(view.id);

		if (view.sections) {
			for (const section of view.sections) {
				ids.add(section.id);

				if (section.items) {
					for (const item of section.items) {
						ids.add(item.id);
					}
				}
			}
		}
	}

	let id;
	while (!id || ids.has(id)) {
		id = Math.floor(Math.random() * 1e13 - 1e12) + 1e12;
	}
	return id;
}

/**
 * Check if given string is a timestamp
 * YYYY-MM-DDTHH:MM:SS
 */
export function isTimestamp(state: string) {
	const format = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
	return format.test(state);
}

/**
 * Converts an ISO formatted timestamp
 * into a relative time string
 */
export function relativeTime(timestamp: string, languageCode: string | undefined) {
	const date = new Date(timestamp);

	if (isNaN(date.getTime())) {
		console.error('Invalid timestamp');
	}

	const formatter = new Intl.RelativeTimeFormat(languageCode, { numeric: 'auto' });

	let index;

	const units: any = [
		['second', 60],
		['minute', 60],
		['hour', 24],
		['day', 30],
		['month', 12],
		['year', Infinity]
	];

	const now = new Date();
	const diff = (date.getTime() - now.getTime()) / 1000;

	let diffUnit = Math.abs(diff);
	for (index = 0; index < units.length; index++) {
		if (diffUnit < units[index][1]) break;
		diffUnit /= units[index][1];
	}

	return formatter.format(Math.round(diffUnit) * (diff < 0 ? -1 : 1), units[index][0]);
}

/**
 * Returns an object of supported features
 */
export function getSupport(
	supported_features: number | undefined,
	features: any
): Record<string, boolean> {
	if (!supported_features) return {};

	return Object.entries(features).reduce((supports: Record<string, boolean>, [key, value]) => {
		if (typeof value === 'number') supports[key] = (supported_features & value) !== 0;
		return supports;
	}, {});
}
