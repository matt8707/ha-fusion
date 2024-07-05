<script lang="ts">
	import { lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import type { Condition } from '$lib/Types';

	export let item: Condition;

	/**
	 * Handles click
	 */
	function handleClick() {
		if (item) item.collapsed = !item?.collapsed;
	}
</script>

<button title={$lang(!item?.collapsed ? 'hide' : 'show')} on:click={handleClick}>
	<Icon icon={!item?.collapsed ? 'octicon:chevron-up-12' : 'octicon:chevron-down-12'} />
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
		background-color: rgba(255, 255, 255, 0.2);
		width: 1.6rem;
		height: 1.6rem;
		flex-shrink: 0;
	}
</style>
