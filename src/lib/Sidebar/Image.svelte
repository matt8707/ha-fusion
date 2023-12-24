<script lang="ts">
	import { states, lang } from '$lib/Stores';

	export let entity_id: string | undefined = undefined;
	export let url: string | undefined = undefined;

	$: src = entity_id && $states?.[entity_id]?.attributes?.entity_picture;
</script>

{#if url}
	<img src={url} alt="url" />
{:else if src}
	<img {src} alt={entity_id} />
{:else}
	{$lang('picture')}
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		padding: var(--theme-sidebar-item-padding);
	}
</style>
