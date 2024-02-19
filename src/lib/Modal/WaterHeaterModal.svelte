<script lang="ts">
	import { states, lang, connection, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Select from '$lib/Components/Select.svelte';
	import Ripple from 'svelte-ripple';
	import Toggle from '$lib/Components/Toggle.svelte';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states?.[sel?.entity_id];
	$: attributes = entity?.attributes;
	$: toggle = entity?.state !== 'off';
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		TARGET_TEMPERATURE: 1,
		OPERATION_MODE: 2,
		AWAY_MODE: 4
	});

	$: options = attributes?.operation_list?.map((option: string) => ({
		id: option,
		icon: icons?.[option] || 'mdi:water-percent',
		label: $lang(`water_heater_${option}`)
	}));

	const icons: Record<string, string> = {
		eco: 'mdi:leaf',
		electric: 'mdi:lightning-bolt',
		performance: 'mdi:rocket-launch',
		high_demand: 'mdi:finance',
		heat_pump: 'mdi:heat-wave',
		gas: 'mdi:fire-circle',
		off: 'mdi:power'
	};

	/**
	 * Handle service calls
	 * 'toggle' | 'set_humidity' | 'set_mode'
	 */
	function handleEvent(
		service: string,
		payload: string | number | boolean | undefined = undefined
	) {
		if (!entity?.entity_id) return;

		let data: Record<string, string | number | boolean | undefined> = {
			entity_id: entity?.entity_id
		};

		if (service === 'set_temperature') {
			data.temperature = payload;
		} else if (service === 'set_operation_mode') {
			data.operation_mode = payload;
		} else if (service === 'set_away_mode') {
			data.away_mode = payload;
		}

		callService($connection, 'water_heater', service, data);
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<!-- TOGGLE -->
		<h2>{$lang('toggle')}</h2>

		<Toggle
			bind:checked={toggle}
			on:change={() => {
				const service = entity?.state !== 'off' ? 'turn_off' : 'turn_on';
				handleEvent(service);
			}}
		/>

		<!-- STATE -->
		{#if entity?.state}
			<h2>{$lang('state')}</h2>

			{$lang('water_heater_' + entity?.state)}
		{/if}

		<!-- TEMPERATURE -->
		<h2>
			{$lang('target')}

			<span class="align-right">
				{#if attributes?.current_temperature}
					{attributes?.current_temperature}° ->
				{/if}

				{attributes?.temperature}°
			</span>
		</h2>

		{#if attributes?.temperature}
			<RangeSlider
				bind:value={attributes.temperature}
				min={parseInt(attributes?.min_temp)}
				max={parseInt(attributes?.max_temp)}
				on:change={(event) => {
					handleEvent('set_temperature', event?.detail);
				}}
			/>
		{/if}

		<!-- OPERATION_MODE  -->
		{#if supports?.OPERATION_MODE && options}
			<h2>
				{$lang('mode')}
			</h2>

			<Select
				{options}
				placeholder={$lang('mode')}
				value={attributes?.operation_mode}
				on:change={(event) => {
					handleEvent('set_operation_mode', event?.detail);
				}}
			/>
		{/if}

		<!-- AWAY_MODE  -->
		{#if supports?.AWAY_MODE}
			<h2>
				{$lang('water_heater_away_mode')}
			</h2>

			<div class="button-container">
				<button
					class:selected={attributes?.away_mode === 'off'}
					on:click={() => {
						handleEvent('set_away_mode', false);
					}}
					use:Ripple={$ripple}
				>
					{$lang('off')}
				</button>

				<button
					class:selected={attributes?.away_mode === 'on'}
					on:click={() => {
						handleEvent('set_away_mode', true);
					}}
					use:Ripple={$ripple}
				>
					{$lang('on')}
				</button>
			</div>
		{/if}

		<!-- <h2>Supports</h2>

		<code>
			<pre>
{JSON.stringify(supports, null, 2)}
			</pre>
		</code>

		<h2>Entity</h2>

		<code>
			<pre>
{JSON.stringify(entity, null, 2)}
			</pre>
		</code> -->

		<ConfigButtons />
	</Modal>
{/if}
