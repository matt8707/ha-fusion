<script lang="ts">
	import { states, dashboard, lang, history, historyIndex, record } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Camera from '$lib/Sidebar/Camera.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { CameraItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: CameraItem;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let imgRef: HTMLImageElement | null = null;

	$: entity_id = sel?.entity_id;
	$: width = sel?.width;
	$: height = sel?.height;

	$: options = Object.keys($states)
		.filter((key) => key.startsWith('camera.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	$: if (entity_id) {
		getDimensions($states?.[entity_id]?.attributes?.entity_picture);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	/**
	 * Get dimensions of entity_picture, and set width/height to `$dashboard`.
	 * It's needed to set the aspect ratio to display the entire image in the iframe.
	 */
	async function getDimensions(entity_picture: string | undefined) {
		// cleanup
		if (imgRef) imgRef.onload = imgRef.onerror = imgRef = null;

		if (!entity_picture) return;

		// promise
		const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
			imgRef = new Image();

			imgRef.onload = () => {
				if (imgRef) {
					resolve({
						width: imgRef.width,
						height: imgRef.height
					});
				}
			};

			imgRef.onerror = () => {
				reject(new Error('Failed to load image'));
			};

			imgRef.src = entity_picture;
		});

		set('width', dimensions.width);
		set('height', dimensions.height);
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('camera')}</h1>

		<h2>{$lang('preview')}</h2>

		{#if sel}
			<div>
				{#key entity_id}
					<Camera {entity_id} preview={true} {width} {height} />
				{/key}
			</div>
		{/if}

		<h2>{$lang('entity')}</h2>

		{#if options}
			<Select
				{options}
				placeholder={$lang('camera')}
				value={entity_id}
				on:change={(event) => {
					set('entity_id', event);
				}}
			/>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	div {
		pointer-events: none;
	}
</style>
