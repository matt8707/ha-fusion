<script lang="ts">
	import {
		drawerSearch,
		focusSearch,
		dashboard,
		currentViewId,
		states,
		filterDashboard,
		lang,
		motion
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import { modals } from 'svelte-modals';
	import InputClear from '$lib/Components/InputClear.svelte';

	let input: HTMLInputElement;

	/**
	 * Handle input focus/blur
	 */
	$: if (input) {
		if ($focusSearch) {
			input.focus();
		} else {
			input.blur();
		}
	}

	/**
	 * Clear `$drawerSearch` when opening a modal
	 */
	$: if ($modals.length !== 0) {
		setTimeout(() => {
			$drawerSearch = undefined;
		}, $motion);
	}

	/**
	 * Set `$filterDashboard` store with filter function
	 */
	$: $filterDashboard = filter(
		$dashboard?.views?.find((view) => view.id === $currentViewId),
		$drawerSearch?.toLowerCase()
	);

	/**
	 * Filters the items of current view based on `$drawerSearch`
	 * entity_id | name | friendly_name | state | $lang(state)
	 */
	function filter(view: any, search?: string) {
		if (!search || !view?.sections) return view;

		const isSearchMatch = (entity_id: string, name: string, attributes: any, state: string) => {
			const searchFields = [entity_id, name, attributes?.friendly_name, state, $lang(state)].map(
				String
			);
			return searchFields.some((field) => field.toLowerCase().includes(search));
		};

		const sectionFilter = (section: any) => {
			if (section.type === 'horizontal-stack' && section.sections) {
				const filteredSubSections = section.sections.map(sectionFilter).filter(Boolean);
				return filteredSubSections.length
					? { ...section, sections: filteredSubSections }
					: undefined;
			}
			if (section.items) {
				const filteredItems = section.items.filter((item: { entity_id: string; name: string }) =>
					isSearchMatch(
						item.entity_id,
						item.name,
						$states?.[item.entity_id]?.attributes,
						$states?.[item.entity_id]?.state
					)
				);
				return filteredItems.length ? { ...section, items: filteredItems } : undefined;
			}
		};

		const filteredSections = view.sections.map(sectionFilter).filter(Boolean);

		return { ...view, sections: filteredSections };
	}

	/**
	 * Clear $drawerSearch` onDestroy
	 */
	onDestroy(() => {
		$drawerSearch = undefined;
		$focusSearch = false;
	});
</script>

<InputClear
	condition={$drawerSearch}
	on:clear={() => {
		$drawerSearch = undefined;
	}}
>
	<input
		type="text"
		class="input"
		bind:this={input}
		bind:value={$drawerSearch}
		on:click={() => ($focusSearch = true)}
		on:blur={() => ($focusSearch = false)}
		name="filter"
		placeholder={$lang('search')}
		autocomplete="off"
		spellcheck="false"
	/>

	<style>
		.input {
			padding: 0 0.9em;
			border-radius: 0.6em;
			border: 1px solid rgba(255, 255, 255, 0.2);
			background-color: rgba(0, 0, 0, 0.2);
			color: white;
			font-family: inherit;
			font-size: inherit;
			height: 100%;
			min-width: 5.5rem;
		}

		.clear {
			position: relative;
		}

		.clear > button {
			background: none;
			color: rgba(255, 255, 255, 0.9);
			font-size: 1.25rem;
			border: none;
			cursor: pointer;
			position: absolute;
			top: 0;
			right: 0;
			width: 2.8rem;
			height: 100%;
		}

		.clear > input {
			padding-right: 2.5rem;
			border: 1px solid rgba(255, 255, 255, 0.3);
		}

		.clear > input::placeholder {
			color: rgba(255, 255, 255, 0.35);
			opacity: 1;
		}

		/* Phone */
		@media all and (max-width: 768px) {
			.input {
				height: 2.8rem;
				width: 100%;
				max-width: unset;
			}

			.clear {
				max-width: unset;
			}
		}
	</style>
</InputClear>
