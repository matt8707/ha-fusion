<script lang="ts">
	import { states } from '$lib/Stores';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: attributes = entity?.attributes;
	$: entity_picture = attributes?.entity_picture;
	$: name = getName(sel, entity);
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{name}</h1>

		<img src={entity_picture} alt={name} />

		<ConfigButtons />
	</Modal>
{/if}

<style>
	img {
		margin-top: 1rem;
		border-radius: 0.6rem;
		width: 100%;
	}
</style>
