<script lang="ts">
	import { states, connection, lang } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import Toggle from '$lib/Components/Toggle.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let selected: any;

	$: entity = $states[selected?.entity_id];
	$: toggle = entity?.state === 'on';

	/**
	 * Calls switch.toggle service
	 */
	function handleClick() {
		callService($connection, 'switch', 'toggle', {
			entity_id: entity?.entity_id
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		<h2>{$lang('toggle')}</h2>

		<Toggle bind:checked={toggle} on:change={handleClick} />

		<br />

		<ConfigButtons />
	</Modal>
{/if}
