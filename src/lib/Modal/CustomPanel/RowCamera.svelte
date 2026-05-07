<script lang="ts">
	import { states, lang } from '$lib/Stores';
	import Camera from '$lib/Main/Camera.svelte';
	import Icon from '@iconify/svelte';
	import type { ModalRowCamera } from '$lib/Types';

	export let row: ModalRowCamera;
	export let configMode = false;

	$: entity = row?.entity_id ? $states[row.entity_id] : undefined;
	$: isCamera = row?.entity_id?.startsWith('camera.');
	$: missing = !row?.entity_id;
</script>

<div class="row-camera">
	{#if missing}
		{#if configMode}
			<div class="placeholder">
				<Icon icon="mdi:camera-off" height="2rem" />
				<span>{$lang('entity_not_configured')}</span>
			</div>
		{/if}
	{:else if !isCamera && !entity}
		{#if configMode}
			<div class="placeholder warning">
				<Icon icon="mdi:camera-off" height="2rem" />
				<span>{row.entity_id} — {$lang('entity_not_found')}</span>
			</div>
		{/if}
	{:else if !isCamera}
		{#if configMode}
			<div class="placeholder warning">
				<Icon icon="mdi:alert" height="2rem" />
				<span>{row.entity_id} — {$lang('not_camera_entity')}</span>
			</div>
		{/if}
	{:else}
		<!-- valid camera -->
		<Camera
			sel={{ id: -1, type: 'camera', entity_id: row.entity_id, stream: row.stream }}
			responsive={true}
			muted={true}
			controls={false}
		/>
	{/if}
</div>

<style>
	.row-camera {
		width: 100%;
		border-radius: 0.5rem;
		overflow: hidden;
		aspect-ratio: 16 / 9;
		background: rgba(0, 0, 0, 0.3);
	}

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.5rem;
		opacity: 0.4;
		font-size: 0.85rem;
	}

	.placeholder.warning {
		color: #ffb347;
		opacity: 0.7;
	}
</style>
