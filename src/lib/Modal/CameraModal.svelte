<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import { states } from '$lib/Stores';
	import { getName } from '$lib/Utils';
	import Camera from '$lib/Main/Camera.svelte';

	export let sel: any;
	export let isOpen: boolean;

	// $: supported_features = attributes?.supported_features;
	// $: supports = getSupport(supported_features, {
	// 	ON_OFF: 1,
	// 	STREAM: 2
	// });
</script>

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">
			{getName(sel, $states?.[sel?.entity_id])}
		</h1>

		<div>
			<Camera {sel} responsive={true} muted={false} controls={true} />
		</div>
	</Modal>
{/if}

<style>
	div {
		position: relative;
		margin-top: 1rem;
	}
</style>
