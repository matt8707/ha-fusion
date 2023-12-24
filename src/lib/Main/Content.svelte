<script lang="ts">
	import { configuration } from '$lib/Stores';
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import Button from '$lib/Main/Button.svelte';
	import Media from '$lib/Main/Media.svelte';

	export let item: any;
</script>

{#if item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] && item?.type === 'media'}
	<div class="shadow" />
{/if}

{#if item?.type === 'button'}
	<Button
		entity_id={item?.entity_id}
		name={item?.name}
		icon={item?.icon}
		color={item?.color}
		marquee={item?.marquee}
		sel={item}
		config={$configuration}
	/>
{:else if item?.type === 'media'}
	<Media sel={item} />
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
