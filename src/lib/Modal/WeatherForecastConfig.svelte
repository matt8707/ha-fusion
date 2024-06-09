<script lang="ts">
	import {
		states,
		dashboard,
		lang,
		record,
		ripple,
		history,
		historyIndex,
		entityList
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import WeatherForecast from '$lib/Sidebar/WeatherForecast.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getSupport, updateObj } from '$lib/Utils';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: any;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: entity = $states[sel?.entity_id];
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		FORECAST_DAILY: 1,
		FORECAST_HOURLY: 2,
		FORECAST_TWICE_DAILY: 4
	});

	let days_to_show = sel?.days_to_show ?? 7;

	let numberElement: HTMLInputElement;

	const iconOptions = [
		{ id: 'meteocons', label: 'meteocons' },
		{ id: 'weathericons', label: 'weather icons' },
		{ id: 'materialsymbolslight', label: 'materialsymbolslight' }
	];

	$: options = $entityList('weather');

	$: range = {
		min: 1,
		max: Math.min(entity?.attributes?.forecast?.length ?? 7, 7)
	};

	function minMax(key: string | number | undefined) {
		return Math.min(Math.max(parseInt(key as string), range.min), range.max);
	}

	function handleNumberRange(event: any) {
		const value = minMax(event?.target?.value);
		set('days_to_show', value);
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
			<WeatherForecast {sel} />
		</div>

		<h2>{$lang('entity')}</h2>

		{#if options}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				{options}
				placeholder={$lang('entity')}
				value={sel?.entity_id}
				on:change={(event) => {
					// remove 'forecast_type' when changing entity_id
					set('forecast_type');
					set('entity_id', event);
				}}
			/>
		{/if}

		<h2>{$lang('icon')}</h2>

		{#if iconOptions}
			<Select
				options={iconOptions}
				placeholder={$lang('icon')}
				value={sel?.icon_pack || 'meteocons'}
				on:change={(event) => set('icon_pack', event)}
			/>
		{/if}

		<h2>{$lang('days_to_show')}</h2>

		{#if options}
			<input
				type="number"
				class="input"
				bind:value={days_to_show}
				bind:this={numberElement}
				min={range.min}
				max={range.max}
				on:change={handleNumberRange}
				autocomplete="off"
			/>
		{/if}

		{#if Object.keys(supports).filter((key) => supports[key]).length > 1}
			<h2>{$lang('forecast_type')}</h2>

			<div class="button-container">
				{#if supports?.FORECAST_DAILY}
					<button
						class:selected={sel?.forecast_type === 'daily' || !sel?.forecast_type}
						on:click={() => set('forecast_type', 'daily')}
						use:Ripple={$ripple}
					>
						{$lang('forecast_daily')}
					</button>
				{/if}

				{#if supports?.FORECAST_HOURLY}
					<button
						class:selected={sel?.forecast_type === 'hourly'}
						on:click={() => set('forecast_type', 'hourly')}
						use:Ripple={$ripple}
					>
						{$lang('forecast_hourly')}
					</button>
				{/if}

				{#if supports?.FORECAST_TWICE_DAILY}
					<button
						class:selected={sel?.forecast_type === 'twice_daily'}
						on:click={() => set('forecast_type', 'twice_daily')}
						use:Ripple={$ripple}
					>
						{$lang('forecast_twice_daily')}
					</button>
				{/if}
			</div>
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
