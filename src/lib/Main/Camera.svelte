<script lang="ts">
	import { states, lang, itemHeight, editMode, itemWidth, itemGap } from '$lib/Stores';
	import { openModal } from 'svelte-modals';

	export let sel: any;

	export let demo: string | undefined = undefined;
	export let stream: boolean = true;

	$: entity_id = sel?.entity_id;
	$: entity = demo || entity_id;

	$: width = sel?.width;
	$: height = sel?.height;

	let url: string | undefined;
	let offsetWidth = 0;
	let offsetHeight = 0;

	/**
	 * When directly embedding mjpeg image and later removed, the stream remains active and continuously
	 * consumes network resources unless the page is refreshed or window.stop() is called. Using an iframe
	 * addresses this issue, and can be made responsive by defining an aspect ratio and scaling its size
	 * based on its parents dimensions.
	 */

	$: if ($states && entity && $states?.[entity]?.attributes?.entity_picture) {
		url = $states[entity].attributes.entity_picture;
	}

	function handleClick() {
		if ($editMode && sel) {
			openModal(() => import('$lib/Modal/CameraConfig.svelte'), { sel });
		} else {
			openModal(() => import('$lib/Modal/CameraModal.svelte'), {
				entity_id: entity,
				width: sel?.width,
				height: sel?.height
			});
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClick}
	bind:offsetWidth
	bind:offsetHeight
	style:aspect-ratio="{width} / {height}"
	style:height={`calc(${$itemHeight}px * 4 + ${$itemGap}rem * 3)`}
	style:width={`calc(${$itemWidth}rem * 4 + ${$itemGap}rem * 3)`}
	style:background-image={url ? `url(${url})` : 'none'}
	style:background-size="{offsetHeight * (width / height)}px {offsetHeight}px"
	style:cursor={!$editMode ? 'pointer' : 'unset'}
>
	<!-- all this binding and transforming essentially aims to
			make the iframe behave like `background-size: cover` -->
	{#if stream && url}
		<iframe
			src={url?.replace('/camera_proxy/', '/camera_proxy_stream/')}
			title={$lang('camera')}
			style:width="{offsetWidth * (width / height)}px"
			style:aspect-ratio="{width} / {height}"
			style:transform="scale({offsetHeight / height})"
		/>
	{/if}
</div>

<style>
	div {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 0.6rem;
		overflow: hidden;
		background-repeat: no-repeat;
	}

	iframe {
		border: none;
		pointer-events: none;
		user-select: none;
		transform-origin: top left;
	}
</style>
