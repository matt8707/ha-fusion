<script lang="ts">
	import { states, dashboard, lang, record } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import WeatherForecast from '$lib/Sidebar/WeatherForecast.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { WeatherForecastItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: WeatherForecastItem;

	let days_to_show = sel?.days_to_show;

	let numberElement: HTMLInputElement;

	const iconOptions = [
		{ id: 'materialsymbolslight', name: 'materialsymbolslight' },
		{ id: 'meteocons', name: 'meteocons' },
		{ id: 'weathericons', name: 'weather icons' }
	];

	$: weatherStates = Object.keys($states)
		.filter((key) => key.startsWith('weather.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	const range = {
		min: 1,
		max: 6
	};

	function minMax(key: string | number | undefined) {
		return Math.min(Math.max(parseInt(key as string), range.min), range.max);
	}

	function handleNumberRange(event: any) {
		console.log(event?.target?.value);
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
			<WeatherForecast
				entity_id={sel?.entity_id}
				icon_pack={sel?.icon_pack}
				days_to_show={sel?.days_to_show}
			/>
		</div>

		<h2>{$lang('entity')}</h2>

		{#if weatherStates}
			<Select
				customItems={true}
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

		<h2>{$lang('days_to_show')}</h2>

		{#if weatherStates}
			<input
				type="number"
				class="input"
				bind:value={days_to_show}
				bind:this={numberElement}
				placeholder="6"
				min={range.min}
				max={range.max}
				on:input={handleNumberRange}
				autocomplete="off"
			/>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}
