<script lang="ts">
	import { states, dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Weather from '$lib/Sidebar/Weather.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Icon from '@iconify/svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { WeatherItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: WeatherItem;

	// init icon
	let extra_sensor_icon: string | undefined = sel?.extra_sensor_icon;

	const iconOptions = [{ id: 'meteocons', label: 'meteocons' }];

	$: weatherStates = Object.keys($states)
		.filter((key) => key.startsWith('weather.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	$: sensorStates = Object.keys($states)
		.filter((key) => key.startsWith('sensor.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('weather')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Weather
				entity_id={sel?.entity_id}
				weather_sensor={sel?.weather_sensor}
				extra_sensor={sel?.extra_sensor}
				icon_pack={sel?.icon_pack}
				show_apparent={sel?.show_apparent}
			/>
		</div>

		<h2>{$lang('entity')}</h2>

		{#if weatherStates}
			<Select
				computeIcons={true}
				options={weatherStates}
				placeholder={$lang('entity')}
				value={sel?.entity_id}
				defaultIcon="mdi:weather-cloudy"
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('weather')}</h2>

		{#if sensorStates}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				options={sensorStates}
				placeholder={$lang('sensor')}
				value={sel?.weather_sensor}
				on:change={(event) => set('weather_sensor', event)}
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

		<h2>{$lang('sensor')} extra</h2>

		{#if sensorStates}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				options={sensorStates}
				placeholder={$lang('sensor')}
				value={sel?.extra_sensor}
				on:change={(event) => set('extra_sensor', event)}
			/>
		{/if}

		<h2>
			{$lang('icon')} extra
		</h2>

		<div class="icon-gallery-container">
			<InputClear
				condition={extra_sensor_icon}
				on:clear={() => {
					extra_sensor_icon = undefined;
					set('extra_sensor_icon');
				}}
				let:padding
			>
				<input
					class="input"
					type="text"
					placeholder={$lang('icon')}
					bind:value={extra_sensor_icon}
					on:change={(event) => set('extra_sensor_icon', event)}
					style:padding
					autocomplete="off"
					spellcheck="false"
				/>
			</InputClear>

			<button
				title={$lang('icon')}
				class="icon-gallery"
				on:click={() => {
					window.open('https://icon-sets.iconify.design/', '_blank');
				}}
				use:Ripple={$ripple}
			>
				<Icon icon="vaadin:grid-small" height="none" />
			</button>
		</div>
		{#if sel?.entity_id}
			{#if $states[sel?.entity_id].attributes.apparent_temperature}
				<h2>Apparent temperature</h2>

				<div class="button-container">
					<button
						class:selected={!sel?.show_apparent}
						on:click={() => set('show_apparent', false)}
						use:Ripple={$ripple}
					>
						{$lang('no')}
					</button>

					<button
						class:selected={sel?.show_apparent}
						on:click={() => set('show_apparent', true)}
						use:Ripple={$ripple}
					>
						{$lang('yes')}
					</button>
				</div>
			{/if}
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
