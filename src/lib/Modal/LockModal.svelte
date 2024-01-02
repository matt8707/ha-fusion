<script lang="ts">
	import { states, connection, lang } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import Toggle from '$lib/Components/Toggle.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: entity_id = entity?.entity_id;
	$: state = entity?.state;
	$: toggle = entity?.state === 'unlocked';

	function handleClick() {
		const service = state === 'locked' ? 'unlock' : 'lock';
		callService($connection, 'lock', service, { entity_id });
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('toggle')}</h2>

		<Toggle bind:checked={toggle} on:change={handleClick} />

		<ConfigButtons />
	</Modal>
{/if}
