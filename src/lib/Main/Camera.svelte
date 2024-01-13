<script lang="ts">
	import { editMode, itemHeight, states } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import { openModal } from 'svelte-modals';
	import Loader from '$lib/Components/Loader.svelte';

	export let sel: any;
	export let demo: string | undefined = undefined;

	let img: HTMLImageElement;

	$: entity = (demo && $states?.[demo]) || $states?.[sel?.entity_id];
	$: attributes = entity?.attributes;

	$: entity_picture = attributes?.entity_picture;
	$: entity_stream = entity_picture?.replace('/camera_proxy/', '/camera_proxy_stream/');

	$: url = !$editMode && sel?.stream === true ? entity_stream : entity_picture;
	$: size = sel?.size === 'contain' ? 'contain' : 'cover';

	/**
	 * Handle camera click
	 */
	function handleClick() {
		if ($editMode && sel) {
			openModal(() => import('$lib/Modal/CameraConfig.svelte'), { sel });
		} else if (url) {
			openModal(() => import('$lib/Modal/CameraModal.svelte'), { sel });
		}
	}

	/**
	 * Remove image src to prevent continuous network activity
	 */
	onDestroy(() => {
		if (img) img.src = '';
	});

	let loaderVisible = true;

	function handleLoader() {
		loaderVisible = false;
	}
</script>

{#if url && entity_picture}
	<button
		style:background-image="url({entity_picture})"
		style:height="calc({$itemHeight}px * 4 + 0.4rem * 3)"
		style:background-size={size}
		on:click={handleClick}
	>
		{#if loaderVisible}
			<div class="loader">
				<Loader />
			</div>
		{/if}

		<!-- svelte-ignore a11y-missing-attribute -->
		<img src={url} bind:this={img} style:object-fit={size} on:load={handleLoader} />
	</button>
{/if}

<style>
	button {
		all: unset;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 0.6rem;
		width: calc(14.5rem * 2 + 0.4rem);
		background-repeat: no-repeat;
		background-position: center center;
		position: relative;
		border: none;
		color: white;
		font-weight: 500;
		font-size: 1.5rem;
		cursor: pointer;
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
	}

	.loader {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: scale(0.5);
	}
</style>
