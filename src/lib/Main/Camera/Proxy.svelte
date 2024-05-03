<script lang="ts">
	import { editMode } from '$lib/Stores';
	import { onMount } from 'svelte';
	import Broken from '$lib/Main/Camera/Broken.svelte';

	export let sel: any;
	export let entity: any;
	export let size: string | undefined;
	export let stream_url: string | undefined;
	export let loaderVisible: boolean | undefined;
	export let responsive: boolean | undefined = undefined;
	export let muted: boolean | undefined = true;

	let img: HTMLImageElement;
	let broken: boolean;
	let date: number;
	let interval: ReturnType<typeof setInterval>;

	$: entity_picture = entity?.attributes?.entity_picture || '';
	$: proxy_stream = (!muted || sel?.stream) && !stream_url && !$editMode;

	function handleError(error: boolean) {
		loaderVisible = false;
		broken = error;
	}

	const updateInterval = 30_000;

	onMount(() => {
		clearInterval(interval);
		interval = setInterval(() => {
			date = Date.now();
		}, updateInterval);

		// cleanup
		return () => {
			clearInterval(interval);
			if (img) img.src = '';
		};
	});
</script>

<img
	src={proxy_stream
		? entity_picture?.replace('/camera_proxy/', '/camera_proxy_stream/')
		: entity_picture
			? `${entity_picture}${date ? '&date=' + date : ''}`
			: 'about:blank'}
	bind:this={img}
	on:error={() => handleError(true)}
	on:load={() => handleError(false)}
	style:display={broken ? 'none' : 'initial'}
	style:width={responsive ? '100%' : 'calc(14.5rem * 2 + 0.4rem)'}
	style:object-fit={size}
	draggable="false"
	style:position={loaderVisible && proxy_stream ? 'absolute' : 'relative'}
	alt=""
/>

{#if broken}
	<Broken />
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
	}
</style>
