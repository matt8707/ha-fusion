<script lang="ts">
	import { editMode, lang, states } from '$lib/Stores';
	import { handleAllConditions, handleAllConditionsForItem } from '$lib/Conditional';
	import type { Condition } from '$lib/Types';

	export let sel: any;
	export let items: Condition[];
	export let matches: { [key: string]: boolean };
	export let isItemTemplate = false;

	/**
	 * Determine if sel is an item (has type property) or a section
	 */
	$: isItem = sel?.type !== undefined;

	/**
	 * Current visibility based on whether it's a section, item, or item template
	 * For item templates, we can't evaluate because entity_id is a placeholder
	 */
	$: visible =
		matches &&
		!isItemTemplate &&
		(isItem
			? handleAllConditionsForItem($editMode, $states, { ...sel, visibility: items })
			: handleAllConditions($editMode, $states, { ...sel, visibility: items }))
			? 'visible'
			: 'hidden';
</script>

<div class="explanation">
	{#if isItemTemplate}
		{$lang('item_visibility_template_explanation')}
	{:else}
		{$lang('visibility_explanation')}

		<div class="evaluate-condition {visible}">
			{$lang(visible)}
		</div>
	{/if}
</div>

<style>
	.explanation {
		margin-top: 1rem;
		padding: 0.9rem 1rem;
		border-radius: 0.65rem;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>
