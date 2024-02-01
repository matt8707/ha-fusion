<script lang="ts">
	import { dashboard, motion, record, lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { generateId } from '$lib/Utils';
	import { createEventDispatcher } from 'svelte';

	export let view: any;

	const dispatch = createEventDispatcher();

	$: noViewsOrSectionsOrStacks =
		!view ||
		!view.sections ||
		view.sections.length === 0 ||
		checkForHorizontalStackOnly(view.sections);

	function checkForHorizontalStackOnly(sections: any[]): boolean {
		return sections.every((section) => {
			// section is a horizontal-stack
			if (section.type === 'horizontal-stack') {
				return section.sections ? checkForHorizontalStackOnly(section.sections) : true;
			}
			// section is not a horizontal-stack
			return false;
		});
	}

	/**
	 * Creates a new button object in
	 * first section of current view
	 */
	function handleClick() {
		if (noViewsOrSectionsOrStacks) return;

		const section = findSection(view.sections);

		if (!section?.items) return;

		section.items.unshift({
			type: 'configure',
			id: generateId($dashboard)
		});

		$dashboard = $dashboard;
		$record();

		dispatch('clicked');
	}

	/**
	 * Finds the first section that is
	 * not of type 'horizontal-stack'.
	 */
	function findSection(sections: any[]): any | undefined {
		for (const section of sections) {
			if (section.type !== 'horizontal-stack') return section;
			const found = section.sections && findSection(section.sections);
			if (found) return found;
		}
	}
</script>

<button
	class="button dropdown"
	on:click={handleClick}
	use:Ripple={{
		...$ripple,
		opacity: noViewsOrSectionsOrStacks ? '0' : $ripple.opacity
	}}
	style:cursor={noViewsOrSectionsOrStacks ? 'unset' : 'pointer'}
	style:opacity={noViewsOrSectionsOrStacks ? '0.5' : '1'}
	style:transition="opacity {$motion}ms ease"
>
	<figure>
		<Icon icon="solar:file-bold-duotone" height="none" />
	</figure>

	{$lang('object')}
</button>
