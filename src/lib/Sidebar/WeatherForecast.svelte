<script lang="ts">
	import { states, selectedLanguage, lang } from '$lib/Stores';
	import { iconMapMaterialSymbolsLight, iconMapMeteocons, iconMapWeatherIcons } from '$lib/Weather';
	import type { WeatherIconSet, WeatherIconConditions, WeatherIconMapping } from '$lib/Weather';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import Icon from '@iconify/svelte';

	export let entity_id: string | undefined;
	export let icon_pack: string | undefined;
	export let number_of_items: number | undefined;

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

	// Because config may not include number_of_items, and some forecasts proviode 48 datapoints, we need to ensure it's correct
	$: calculated = Math.min(number_of_items ?? 7, 7);

	interface Forecast {
		condition: string;
		icon: WeatherIconMapping;
		date: string;
		temperature: number;
	}
	let forecast: Forecast[];
	$: forecast = entity?.attributes?.forecast?.slice(0, calculated).map(function (item: any) {
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

	// Different forecast providers choose different intervals, we need to figure out display based on this
	$: forecast_diff =
		(new Date(forecast?.[1]?.date).valueOf() - new Date(forecast?.[0]?.date).valueOf()) / 3600000;
</script>

{#if entity_state}
	<div class="container">
		{#each forecast as forecast}
			<div class="item">
				<div class="day">
					{#if forecast_diff < 24}
						{new Intl.DateTimeFormat($selectedLanguage, { hour: 'numeric' }).format(
							new Date(forecast.date)
						)}
					{:else}
						{new Intl.DateTimeFormat($selectedLanguage, { weekday: 'short' }).format(
							new Date(forecast.date)
						)}
					{/if}
				</div>

				<div class="icon">
					{#if forecast.icon.local}
						<icon class="ff-fill">
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

				<div class="temp">
					{Math.round(forecast.temperature)}{attributes?.temperature_unit || '°'}
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="container-empty">
		{$lang('weather_forecast')}
	</div>
{/if}

<style>
	.item {
		display: grid;
		grid-column-gap: 0px;
		grid-row-gap: 0px;
		grid-template-areas:
			'day'
			'icon'
			'temp';
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		text-overflow: ellipsis;
		overflow: hidden;
		width: 3.6rem;
	}

	.container {
		padding: var(--theme-sidebar-item-padding);
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		text-overflow: ellipsis;
		overflow: hidden;
		justify-content: space-between;
	}

	.day {
		grid-area: day;
		justify-content: center;
		display: flex;
		width: 3.6rem;
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

	.temp {
		grid-area: temp;
		justify-content: center;
		display: flex;
		white-space: nowrap;
		width: 3.6rem;
		overflow: hidden;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	.ff-fill {
		width: 3.6rem;
		height: 3.6rem;
	}
</style>
