<script lang="ts">
	import { editMode, itemHeight, states } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Loader from '$lib/Components/Loader.svelte';
	import { writable } from 'svelte/store';
	import type { CameraItem } from '$lib/Types';

	export let sel: CameraItem;
	export let demo: string | undefined = undefined;
	export let responsive: boolean;
	export let muted: boolean;
	export let controls: boolean;

	const debug = false;

	let loaderVisible = true;
	let stream_url: string | undefined;
	let attachVideo: boolean;

	$: entity = (demo && $states?.[demo]) || (sel?.entity_id ? $states?.[sel?.entity_id] : undefined);
	$: frontend_stream_type = entity?.attributes?.frontend_stream_type;
	$: size = sel?.size === 'contain' ? 'contain' : 'cover';

	$: props = {
		entity,
		sel,
		size,
		responsive,
		muted
	};

	/**
	 * tame reactivity
	 */
	const entity_id = writable<string | undefined>(sel?.entity_id);
	const stream = writable<boolean | undefined>(sel?.stream);

	$: if (sel?.entity_id) $entity_id = sel?.entity_id;
	$: if (!sel?.stream || sel?.stream) $stream = sel?.stream;

	$: if ((!muted || $stream === true) && $entity_id && !$editMode) {
		attachVideo = true;
	} else if ($stream === false || $stream === undefined || $entity_id) {
		attachVideo = false;
	}

	entity_id.subscribe((value) => {
		$entity_id = value;
		attachVideo = false;
	});

	/**
	 * Handle camera click
	 */
	function handleClick() {
		if (responsive) return;

		if ($editMode) {
			openModal(() => import('$lib/Modal/CameraConfig.svelte'), { sel });
		} else {
			openModal(() => import('$lib/Modal/CameraModal.svelte'), { sel });
		}
	}
</script>

<button
	style:background-size={size}
	style:cursor={$editMode || responsive ? 'unset' : 'pointer'}
	style:height={responsive ? '100%' : `calc(${$itemHeight}px * 4 + 0.4rem * 3)`}
	style:width={responsive ? '100%' : 'calc(14.5rem * 2 + 0.4rem)'}
	on:click={handleClick}
>
	{#if loaderVisible && !$editMode}
		<!-- loader -->
		<div class="loader">
			<div>
				<Loader />
			</div>
		</div>
	{/if}

	{#if frontend_stream_type === 'hls'}
		<!-- hls -->
		{#await import('$lib/Main/Camera/HLS.svelte') then HLS}
			<svelte:component
				this={HLS.default}
				bind:stream_url
				bind:loaderVisible
				{...props}
				{attachVideo}
				{controls}
				{debug}
			/>
		{/await}
	{:else if frontend_stream_type === 'web_rtc'}
		<!-- web_rtc -->
		{#await import('$lib/Main/Camera/WebRTC.svelte') then WebRTC}
			<svelte:component
				this={WebRTC.default}
				bind:stream_url
				bind:loaderVisible
				{...props}
				{attachVideo}
				{controls}
				{debug}
			/>
		{/await}
	{/if}

	<!-- camera_proxy -->
	{#await import('$lib/Main/Camera/Proxy.svelte') then Proxy}
		<svelte:component this={Proxy.default} bind:loaderVisible {...props} {stream_url} />
	{/await}

	<!-- info -->
	{#if muted && !responsive}
		{#await import('$lib/Main/Camera/Info.svelte') then Info}
			<svelte:component this={Info.default} {sel} {entity} />
		{/await}
	{/if}
</button>

<style>
	.loader {
		aspect-ratio: 16/9;
	}

	.loader > div {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: scale(0.5);
		z-index: 1;
		pointer-events: none;
	}

	button {
		all: unset;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 0.6rem;
		height: 100%;
		position: relative;
		color: white;
		overflow: hidden;
		display: grid;
		box-sizing: border-box;
		--container-padding: 0.8rem;
	}
</style>
