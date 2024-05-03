<script lang="ts">
	import { editMode, itemHeight, motion } from '$lib/Stores';
	import { openModal } from 'svelte-modals';

	export let sel: any;

	/**
	 * Handle click
	 */
	async function handleClick() {
		if ($editMode) {
			openModal(() => import('$lib/Modal/EmptyConfig.svelte'), { sel });
		}
	}
</script>

<div
	on:click={handleClick}
	class="container"
	style:height="{$itemHeight}px"
	style:opacity={$editMode ? '1' : '0'}
	style:transition="opacity {$motion}ms ease"
	on:keydown
	role="button"
	tabindex="0"
></div>

<style>
	.container {
		width: 14.5rem;
		background-color: rgba(255, 255, 255, 0.25);
		border-radius: 0.65rem;
		margin: 0;
		outline: 2px dashed #fff;
		outline-offset: -2px;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		.container {
			width: calc(50vw - 1.45rem);
		}
	}
</style>
