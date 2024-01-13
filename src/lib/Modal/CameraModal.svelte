<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import { lang, states } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import { getName } from '$lib/Utils';
	import type { CameraItem } from '$lib/Types';
	import Loader from '$lib/Components/Loader.svelte';

	export let isOpen: boolean;
	export let sel: CameraItem;

	let img: HTMLImageElement;

	$: entity = $states?.[(sel as any)?.entity_id];
	$: attributes = entity?.attributes;

	$: entity_picture = attributes?.entity_picture;
	$: entity_stream = entity_picture?.replace('/camera_proxy/', '/camera_proxy_stream/');

	/**
	 * Remove image src to prevent continuous network activity
	 */
	onDestroy(() => {
		if (img) img.src = '';
	});

	const alt = getName(sel, entity);

	let loaderVisible = true;

	function handleLoader() {
		loaderVisible = false;
	}
</script>

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{$lang('camera')}</h1>

		<div class="container">
			<img class="picture" src={entity_picture} {alt} />

			{#if loaderVisible}
				<Loader />
			{/if}

			<img class="stream" src={entity_stream} {alt} bind:this={img} on:load={handleLoader} />
		</div>
	</Modal>
{/if}

<style>
	.container {
		position: relative;
		margin-top: 1rem;
	}

	img {
		width: 100%;
		pointer-events: none;
		border-radius: calc(1.9rem - 1.2rem); /* child radius = parent radius - padding */
	}

	.picture {
		display: grid;
	}

	.stream {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
