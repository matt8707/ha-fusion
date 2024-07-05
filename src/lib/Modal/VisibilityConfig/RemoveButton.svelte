<script lang="ts">
	import { lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import type { Condition } from '$lib/Types';

	export let item: Condition;
	export let items: Condition[];

	/**
	 * Removes selected condition or nested condition
	 */
	function handleClick(item: Condition): Condition[] {
		const removeItem = (items: Condition[]): Condition[] =>
			items
				.filter((condition) => condition.id !== item.id)
				.map((condition) =>
					condition.conditions
						? { ...condition, conditions: removeItem(condition.conditions) }
						: condition
				);
		return (items = removeItem(items));
	}
</script>

<button title={$lang('remove')} on:click={() => handleClick(item)}>
	<Icon icon="mingcute:close-fill" />
</button>

<style>
	button {
		all: unset;
		color: white;
		border-radius: 0.35rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		background-color: #ae2e2e;
		width: 1.6rem;
		height: 1.6rem;
		flex-shrink: 0;
	}
</style>
