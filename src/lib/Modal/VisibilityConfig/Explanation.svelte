<script lang="ts">
	import { editMode, lang, states } from '$lib/Stores';
	import { handleAllConditions, handleAllConditionsForItem } from '$lib/Conditional';
	import type { Condition } from '$lib/Types';

	export let sel: any;
	export let items: Condition[];
	export let matches: { [key: string]: boolean };
	export let isItemTemplate: boolean = false;

	$: isItem = sel?.type !== undefined;

	$: visible =
		matches &&
		(isItem || isItemTemplate
			? handleAllConditionsForItem($editMode, $states, { ...sel, visibility: items })
			: handleAllConditions($editMode, $states, { ...sel, visibility: items }))
			? 'visible'
			: 'hidden';
</script>

<div class="explanation">
	{$lang('visibility_explanation')}

	<div class="evaluate-condition {visible}">
		{$lang(visible)}
	</div>
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
