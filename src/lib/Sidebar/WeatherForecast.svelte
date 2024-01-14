<script lang="ts">
	import { states, selectedLanguage, lang } from '$lib/Stores';
	import { iconMapMaterialSymbolsLight, iconMapMeteocons, iconMapWeatherIcons } from '$lib/Weather';
	import type { WeatherIconSet, WeatherIconConditions, WeatherIconMapping } from '$lib/Weather';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import Icon from '@iconify/svelte';

	export let entity_id: string | undefined;
	export let icon_pack: string | undefined;
	export let days_to_show: number | undefined;

	let entity: HassEntity;
	$: {
		if (entity_id) {
			if ($states?.[entity_id]?.last_updated !== entity?.last_updated) {
				entity = $states?.[entity_id];
			}
		}
	}

	$: entity_state = entity?.state;
	$: attributes = entity?.attributes;

	let iconSet: WeatherIconSet;
	$: {
		if (icon_pack === 'materialsymbolslight') {
			iconSet = iconMapMaterialSymbolsLight;
		} else if (icon_pack === 'meteocons') {
			iconSet = iconMapMeteocons;
		} else if (icon_pack === 'weathericons') {
			iconSet = iconMapWeatherIcons;
		} else {
			iconSet = iconMapMeteocons;
		}
	}

	console.log(days_to_show);

	interface Forecast {
		condition: string;
		icon: WeatherIconMapping;
		date: string;
		temperature: number;
	}
	$: forecast = entity?.attributes?.forecast?.slice(0, days_to_show).map(function (item: any) {
		let icon: WeatherIconMapping =
			iconSet.conditions[item?.condition as keyof WeatherIconConditions];
		let x: Forecast = {
			condition: item?.condition,
			icon: icon,
			date: item?.datetime,
			temperature: item?.temperature
		};

		return x;
	});
</script>

{#if entity_state}
	<div class="container container-condensed">
		{#each forecast as forecast, i}
			<div class="day" style="grid-area: {`f${i + 1}-day`}">
				{new Intl.DateTimeFormat($selectedLanguage, { weekday: 'short' }).format(
					new Date(forecast.date)
				)}
			</div>

			<div class="icon" style="grid-area: {`f${i + 1}-icon`};">
				{#if forecast.icon.local}
					<icon>
						<img
							src={`${forecast.icon.icon_variant_day}.svg`}
							alt={entity_state}
							width="100%"
							height="100%"
						/>
					</icon>
				{:else}
					<Icon icon={forecast.icon.icon_variant_day} width="100%" height="100%"></Icon>
				{/if}
			</div>

			<div class="temp" style="grid-area: {`f${i + 1}-temp`}">
				{Math.round(forecast.temperature)}{attributes?.temperature_unit || '°'}
			</div>
		{/each}
	</div>
{:else}
	<div class="container-empty">
		{$lang('weather_forecast')}
	</div>
{/if}

<style>
	.container {
		padding: var(--theme-sidebar-item-padding);
		display: grid;
		grid-template-columns: repeat(6, 3rem);
		grid-column-gap: 20px;
		grid-row-gap: 0px;
		grid-template-areas:
			'f1-day f2-day f3-day f4-day f5-day f6-day'
			'f1-icon f2-icon f3-icon f4-icon f5-icon f6-icon'
			'f1-temp f2-temp f3-temp f4-temp f5-temp f6-temp';
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.icon {
		grid-area: icon;
		width: 3.6rem;
		height: 3.6rem;
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		justify-content: center;
		transform-origin: right;
	}

	.day {
		justify-content: center;
		display: flex;
		width: 3.6rem;
	}

	.temp {
		justify-content: center;
		display: flex;
		white-space: nowrap;
		width: 3.6rem;
		overflow: hidden;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}
</style>
