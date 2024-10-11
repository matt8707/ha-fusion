<script lang="ts">
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import Button from '$lib/Main/Button.svelte';
	import ConditionalMedia from '$lib/Main/ConditionalMedia.svelte';
	import PictureElements from '$lib/Main/PictureElements.svelte';
	import Camera from '$lib/Main/Camera.svelte';
	import Configure from '$lib/Main/Configure.svelte';
	import Empty from '$lib/Main/Empty.svelte';

	export let item: any;
	export let sectionName: string | undefined = undefined;

	const large = ['conditional_media', 'picture_elements', 'camera'];
</script>

{#if item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] && large.includes(item?.type)}
	<div class="shadow"></div>
{/if}

{#if item?.type === 'configure'}
	<Configure sel={item} />
{:else if item?.type === 'button'}
	<Button sel={item} {sectionName} />
{:else if item?.type === 'conditional_media'}
	<ConditionalMedia sel={item} />
{:else if item?.type === 'picture_elements'}
	<PictureElements sel={item} />
{:else if item?.type === 'camera'}
	<Camera sel={item} responsive={false} muted={true} controls={false} />
{:else if item?.type === 'empty'}
	<Empty sel={item} />
{:else}
	<!-- if types are changed internally, don't break ui -->
	<Configure sel={{ id: item?.id }} />
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
