<script lang="ts">
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import Button from '$lib/Main/Button.svelte';
	import Media from '$lib/Main/Media.svelte';
	import Camera from '$lib/Main/Camera.svelte';
	import Configure from '$lib/Main/Configure.svelte';

	export let item: any;
	export let sectionName: string | undefined = undefined;
</script>

{#if item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] && item?.type === 'media'}
	<div class="shadow" />
{/if}

{#if item?.type === 'configure'}
	<Configure sel={item} />
{:else if item?.type === 'button'}
	<Button sel={item} {sectionName} />
{:else if item?.type === 'media'}
	<Media sel={item} />
{:else if item?.type === 'camera'}
	<Camera sel={item} />
{/if}

<style>
	.shadow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		visibility: visible;
		background: rgba(0, 0, 0, 0.125);
		margin: 0;
		border-radius: 0.65rem;
	}
</style>
