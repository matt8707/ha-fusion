<script lang="ts">
	import { states, lang, connection, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getDomain, getName } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: any;

	let showPassword = false;

	$: entity = $states[sel?.entity_id];
	$: state = entity?.state;

	/**
	 * Handles input_datetime
	 */
	function handleChange(event: any) {
		if (!entity?.entity_id) return;

		const domain = getDomain(entity?.entity_id) as string;
		const target = event?.target as HTMLInputElement;

		callService($connection, domain, 'set_value', {
			entity_id: entity?.entity_id,
			value: target?.value
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>
			{#if entity?.attributes?.mode === 'text'}
				{$lang('text')}
			{:else}
				{$lang('password')}
			{/if}
		</h2>

		<input
			class="input"
			min={entity?.attributes?.min}
			max={entity?.attributes?.max}
			value={state === 'unknown' ? '' : state}
			type={entity?.attributes?.mode === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
			on:change={handleChange}
		/>

		<br />

		{#if entity?.attributes?.mode === 'password'}
			<div>
				<input type="checkbox" id="show" bind:checked={showPassword} use:Ripple={$ripple} />
				<label for="show">{$lang('show_password')}</label>
			</div>
		{/if}

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.input[type='text'] {
		color-scheme: dark;
	}

	input[type='checkbox'] {
		color-scheme: dark;
	}

	div {
		padding-top: 1rem;
	}
</style>
