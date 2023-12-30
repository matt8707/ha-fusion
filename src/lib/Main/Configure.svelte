<script lang="ts">
	import { itemHeight, editMode, disableMenuButton, showDrawer, motion } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import { onDestroy, tick } from 'svelte';

	export let sel: any;

	let timeout: ReturnType<typeof setTimeout> | null;

	/**
	 * Opens `MainItemConfig`
	 */
	async function handleClick() {
		if (!$disableMenuButton) {
			openModal(() => import('$lib/Modal/MainItemConfig.svelte'), { sel });

			await tick();

			timeout = setTimeout(() => {
				$editMode = true;
				$showDrawer = true;
			}, $motion);
		}
	}

	onDestroy(() => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	style:height="{$itemHeight}px"
	on:click={handleClick}
	style:cursor={$editMode ? 'unset' : 'pointer'}
/>

<style>
	div {
		border-radius: 0.65rem;
		background-color: rgba(255, 190, 10, 0.25);
		outline: rgb(255, 192, 8) dashed 2px;
		outline-offset: -2px;
	}
</style>
