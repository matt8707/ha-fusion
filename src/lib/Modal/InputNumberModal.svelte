<script lang="ts">
	import { states, lang, connection, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getDomain, getName } from '$lib/Utils';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import { callService } from 'home-assistant-js-websocket';
	import { onDestroy } from 'svelte';
	import { slide } from 'svelte/transition';

	export let isOpen: boolean;
	export let sel: any;

	let draggingValue: number | undefined;
	let timeout: ReturnType<typeof setTimeout>;
	let errorMessage: string | undefined;

	$: entity = $states[sel?.entity_id];

	$: value =
		entity && (draggingValue === 0 || draggingValue !== undefined)
			? draggingValue
			: Number(entity?.state);

	/**
	 * Updates the specified entity's value using
	 * the 'input_number' or 'number' service
	 */
	async function handleChange(value: number) {
		if (!entity?.entity_id) return;
		const service = getDomain(entity.entity_id) as string;

		errorMessage = undefined;

		try {
			await callService($connection, service, 'set_value', {
				entity_id: entity?.entity_id,
				value
			});
		} catch (error: any) {
			errorMessage = error?.message;
		}
	}

	/**
	 * Handle input_number 'box' mode
	 */
	function handleInputBox(event: any) {
		const target = event?.target as HTMLInputElement;
		handleChange(parseFloat(target?.value));
	}

	/**
	 * Ends drag event handling by resetting
	 * `draggingValue` after a delay
	 */
	function handleEvent() {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			draggingValue = undefined;
		}, $motion);
	}

	/**
	 * Clean-up operations when the
	 * component is unmounted
	 */
	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<svelte:window on:pointerup={handleEvent} />

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>
			{$lang('state')}

			<span class="align-right">
				{value}

				{#if entity?.attributes?.unit_of_measurement}
					{entity.attributes.unit_of_measurement}
				{/if}
			</span>
		</h2>

		{#if entity && entity?.attributes?.mode === 'box'}
			<input
				class="input"
				type="number"
				value={Number(entity?.state)}
				min={entity?.attributes?.min}
				max={entity?.attributes?.max}
				step={entity?.attributes?.step}
				on:change={handleInputBox}
			/>
		{:else}
			<RangeSlider
				{value}
				min={entity?.attributes?.min}
				max={entity?.attributes?.max}
				step={entity?.attributes?.step}
				on:input={(event) => {
					draggingValue = event?.detail;
				}}
				on:change={(event) => {
					handleChange(event?.detail);
				}}
			/>
		{/if}

		{#if errorMessage}
			<p transition:slide={{ duration: $motion / 1.5 }}>
				{errorMessage}
			</p>
		{/if}

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.input[type='number'] {
		color-scheme: dark;
	}

	p {
		color: white;
		margin-bottom: 12px;
		background-color: rgb(178 0 0 / 74%);
		padding: 0.6rem 0.7rem 0.45rem 0.7rem;
		border-radius: 0.6rem;
		font-family: monospace;
		font-size: 0.85rem;
		border: 1px solid rgb(255 255 255 / 15%);
	}
</style>
