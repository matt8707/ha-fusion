<script lang="ts">
	import { states } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states?.[sel?.entity_id];
	$: group = entity?.attributes?.entity_id;
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		{#each group as child_entity_id}
			<h2>{getName(undefined, $states?.[child_entity_id])}</h2>

			<StateLogic entity_id={child_entity_id} selected={undefined} />
		{/each}

		<ConfigButtons />
	</Modal>
{/if}
