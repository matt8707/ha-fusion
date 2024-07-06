<script lang="ts">
	import { dashboard, lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import type { Condition } from '$lib/Types';
	import { generateId } from '$lib/Utils';

	export let items: Condition[];

	const buttons: Array<{ id: Condition['condition']; icon: string; label: string }> = [
		{ id: 'state', icon: 'mdi:state-machine', label: $lang('state') },
		{ id: 'numeric_state', icon: 'tabler:number-123', label: $lang('numeric_state') },
		{ id: 'screen', icon: 'tabler:arrow-autofit-width', label: $lang('screen') },
		{ id: 'and', icon: 'tabler:logic-and', label: $lang('and') },
		{ id: 'or', icon: 'tabler:logic-or', label: $lang('or') }
	];

	/**
	 * Adds a condition to `items`
	 * if nested add empty `conditions`
	 */
	function handleClick(option: Condition['condition']) {
		items = [
			{
				condition: option,
				id: generateId($dashboard),
				...(option === 'and' || option === 'or' ? { conditions: [] } : {})
			},
			...items
		];
	}
</script>

<h2>
	{$lang('add_condition')}
</h2>

<div>
	{#each buttons as button}
		{#if button?.id}
			<button class="action options" on:click={() => handleClick(button?.id)} use:Ripple={$ripple}>
				{$lang(button?.id)}
			</button>
		{/if}
	{/each}
</div>

<style>
	div {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		overflow: hidden;
	}

	.action.options {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-shrink: 1;
		min-width: 0;
		background-color: rgba(0, 0, 0, 0.15) !important;
		border: 1px solid rgba(255, 255, 255, 0.25) !important;
	}
</style>
