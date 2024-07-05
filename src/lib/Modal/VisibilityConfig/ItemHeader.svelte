<script lang="ts">
	import { lang } from '$lib/Stores';
	import EvaluateCondition from '$lib/Modal/VisibilityConfig/EvaluateCondition.svelte';
	import CollapseButton from '$lib/Modal/VisibilityConfig/CollapseButton.svelte';
	import RemoveButton from '$lib/Modal/VisibilityConfig/RemoveButton.svelte';
	import type { Condition } from '$lib/Types';

	export let item: Condition;
	export let items: Condition[];
	export let matches: { [key: string]: boolean };
	export let innerWidth: number;
</script>

<div class="header">
	<h2 data-modal>
		{$lang(item?.condition || '')}
	</h2>

	<div class="right">
		<EvaluateCondition {item} {matches} {innerWidth} />

		<CollapseButton bind:item />

		<RemoveButton {item} bind:items />
	</div>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		margin: 0 !important;
		padding-right: 0.5rem;
	}

	.right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}
</style>
