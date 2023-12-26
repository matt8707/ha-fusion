<script lang="ts">
	import { states, editMode, lang, motion } from '$lib/Stores';

	export let entity_id: string | undefined = undefined;
	export let demo: string | undefined = undefined;
	export let preview: boolean = false;
	export let stream: boolean = true;
	export let width: number = 640;
	export let height: number = 360;

	$: entity = demo || entity_id;
	let url: string | undefined;
	let offsetWidth = 0;

	/**
	 * When directly embedding mjpeg image and later removed, the stream remains active and continuously
	 * consumes network resources unless the page is refreshed or window.stop() is called. Using an iframe
	 * addresses this issue, and can be made responsive by defining an aspect ratio and scaling its size
	 * based on its parents dimensions.
	 */

	$: if ($states && entity && $states?.[entity]?.attributes?.entity_picture) {
		url = $states[entity].attributes.entity_picture;
	}
</script>

<div
	style:padding={!preview ? 'var(--theme-sidebar-item-padding)' : 'unset'}
	style:cursor={!preview && !$editMode ? 'pointer' : 'unset'}
>
	<div
		class="container"
		bind:offsetWidth
		style:aspect-ratio="{width} / {height}"
		style:transition="aspect-ratio {$motion}ms ease"
		style:background-image={url ? `url(${url})` : 'none'}
	>
		{#if stream && url}
			<iframe
				src={url?.replace('/camera_proxy/', '/camera_proxy_stream/')}
				title={$lang('camera')}
				style:background="url({url})"
				style:width="{width}px"
				style:height="{height}px"
				style:transform="scale({offsetWidth / width})"
			/>
		{/if}
	</div>
</div>

<style>
	.container {
		position: relative;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.2);
		color: #fff;
		border-radius: 0.6rem;
		overflow: hidden;
		outline: 1px solid rgb(80, 80, 80);
		outline-offset: 0;
		background-size: cover;
		background-repeat: no-repeat;
	}

	iframe {
		transform-origin: top left;
		border: none;
		pointer-events: none;
		user-select: none;
	}
</style>
