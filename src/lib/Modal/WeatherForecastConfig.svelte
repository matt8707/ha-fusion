<script lang="ts">
	import { states, dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import WeatherForecast from '$lib/Sidebar/WeatherForecast.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import type { WeatherForecastItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: WeatherForecastItem;

	let number_of_items = sel?.number_of_items ?? 7;

	let numberElement: HTMLInputElement;

	let entity: HassEntity;
	$: {
		if (sel?.entity_id) {
			if ($states?.[sel?.entity_id]?.last_updated !== entity?.last_updated) {
				entity = $states?.[sel?.entity_id];
			}
		}
	}

	const iconOptions = [
		{ id: 'materialsymbolslight', label: 'materialsymbolslight' },
		{ id: 'meteocons', label: 'meteocons' },
		{ id: 'weathericons', label: 'weather icons' }
	];

	$: weatherStates = Object.keys(
		Object.fromEntries(
			Object.entries($states).filter(
				([key, value]) => key.startsWith('weather.') && value?.attributes?.forecast
			)
		)
	)
		.sort()
		.map((key) => ({ id: key, label: key }));

	$: range = {
		min: 1,
		max: Math.min(entity?.attributes?.forecast?.length ?? 7, 7)
	};

	function minMax(key: string | number | undefined) {
		return Math.min(Math.max(parseInt(key as string), range.min), range.max);
	}

	function handleNumberRange(event: any) {
		const value = minMax(event?.target?.value);
		set('number_of_items', value);
		if (numberElement) numberElement.value = String(value);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('weather_forecast')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<WeatherForecast
				entity_id={sel?.entity_id}
				icon_pack={sel?.icon_pack}
				number_of_items={sel?.number_of_items}
			/>
		</div>

		<h2>{$lang('entity')}</h2>

		{#if weatherStates}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				options={weatherStates}
				placeholder={$lang('entity')}
				value={sel?.entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('icon')}</h2>

		{#if iconOptions}
			<Select
				options={iconOptions}
				placeholder={$lang('icon')}
				value={sel?.icon_pack}
				on:change={(event) => set('icon_pack', event)}
			/>
		{/if}

		<h2>{$lang('count')}</h2>

		{#if weatherStates}
			<input
				type="number"
				class="input"
				bind:value={number_of_items}
				bind:this={numberElement}
				min={range.min}
				max={range.max}
				on:change={handleNumberRange}
				autocomplete="off"
			/>
		{/if}

		<h2>{$lang('mobile')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.hide_mobile !== true}
				on:click={() => set('hide_mobile')}
				use:Ripple={$ripple}
			>
				{$lang('visible')}
			</button>

			<button
				class:selected={sel?.hide_mobile === true}
				on:click={() => set('hide_mobile', true)}
				use:Ripple={$ripple}
			>
				{$lang('hidden')}
			</button>
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}
