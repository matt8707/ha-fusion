<script lang="ts">
	import { motion, editMode } from '$lib/Stores';

	export let defaultValue: string | undefined = '50';
	export let size: number | undefined = undefined;
	export let mode: string | undefined = undefined;

	let clientHeight: number;
</script>

<div
	class="container"
	style:height={mode === 'empty' ? `${size || defaultValue}px` : `${clientHeight}px`}
	style:transition="height {$motion}ms ease"
>
	{#if mode === 'empty'}
		<div
			class="empty"
			style:height={`${size || defaultValue}px`}
			style:opacity={$editMode ? '1' : '0'}
			style:transition="opacity {$motion}ms ease, height {$motion}ms ease"
		></div>
	{:else}
		<div class="hr-padding" bind:clientHeight>
			<hr />
		</div>
	{/if}
</div>

<style>
	.hr-padding {
		padding: var(--theme-sidebar-item-padding);
	}

	hr {
		padding: 0;
		margin: 0;
		border: 0;
		height: 0;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: var(--theme-sidebar-divider);
	}

	.empty {
		border-radius: 0.6rem;
		background-color: rgba(255, 255, 255, 0.25);
		outline: 2px dashed #fff;
		outline-offset: -2px;
	}
</style>
