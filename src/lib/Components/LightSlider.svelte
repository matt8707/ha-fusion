<script lang="ts">
	import { connection } from '$lib/Stores';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';

	export let entity: HassEntity;
	export let brightness: number;
	export let current: number;

	export let debounce: boolean;
	export let timeout: ReturnType<typeof setTimeout> | undefined;
	export let rangeValue: number;

	let request: Promise<unknown> | undefined = undefined;

	$: if (!debounce) rangeValue = brightness || 0;

	/**
	 * Adjusts the brightness via a service call.
	 *
	 * If a service request is already active, subsequent changes won't trigger additional
	 * requests. This prevents potential overload from multiple concurrent calls.
	 *
	 * The `rangeValue` update is debounced to enhance UI responsiveness with grouped lights.
	 * This minimizes unwanted feedback on the slider, preventing it from jumping erratically.
	 */
	async function handleChange(brightness: number) {
		if (request) return;

		debounce = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			debounce = false;
			rangeValue = brightness || 0;
		}, 2500);

		request = callService($connection, 'light', 'turn_on', {
			entity_id: entity?.entity_id,
			brightness: brightness
		});

		try {
			await request;
		} catch (error) {
			console.error('Failed to change brightness:', error);
		} finally {
			request = undefined;
		}
	}
</script>

{#if entity}
	<RangeSlider
		value={rangeValue}
		min={0}
		max={255}
		on:input={(event) => {
			current = Math.round(event.detail / 2.55);
			handleChange(Math.round(event.detail));
		}}
		on:change={(event) => {
			request = undefined;
			handleChange(Math.round(event.detail));
		}}
	/>
{/if}
