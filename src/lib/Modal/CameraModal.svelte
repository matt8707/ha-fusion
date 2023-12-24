<script lang="ts">
	import Camera from '$lib/Sidebar/Camera.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { lang } from '$lib/Stores';

	export let isOpen: boolean;
	export let entity_id: string | undefined;
	export let width: number = 640;
	export let height: number = 360;
</script>

{#if isOpen}
	<Modal size="large" info="camera_stream">
		<h1 slot="title">{$lang('camera')}</h1>

		<br />

		<Camera {entity_id} preview={true} {width} {height} />
	</Modal>
{/if}

<style>
	br {
		margin-bottom: 1rem;
	}
</style>
