<script lang="ts">
	/**
	 * Rewrite
	 */

	import { states, selectedLanguage, lang } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import Icon from '@iconify/svelte';

	export let entity_id: string | undefined;
	export let extra_sensor: string | undefined = undefined;
	export let extra_sensor_icon: string | undefined = undefined;
	export let weather_sensor: string | undefined = undefined;
	export let icon_pack: string | undefined = undefined;
	export let show_apparent: boolean | undefined = undefined;

	let precipitation: string | undefined;
	let path: string;

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
	$: sun = $states?.['sun.sun']?.state;

	$: if (extra_sensor) {
		precipitation = $states?.[extra_sensor]?.state;
	}

	$: {
		if (icon_pack === 'meteocons') {
			path = 'meteocons';
		} else {
			path = 'meteocons';
		}
	}
</script>

{#if entity_state}
	<div class="container">
		<icon class="icon">
			{#if entity_state !== 'unavailable'}
				{#if sun === 'below_horizon'}
					<img
						src={`weather/${path}/${entity_state}-night.svg`}
						alt={entity_state}
						width="100%"
						height="100%"
					/>
				{:else}
					<img
						src={`weather/${path}/${entity_state}-day.svg`}
						alt={entity_state}
						width="100%"
						height="100%"
					/>
				{/if}
			{/if}
		</icon>

		{#if attributes?.temperature}
			{#if show_apparent}
				<div class="temp">
					{Math.round(attributes?.temperature)}{#if attributes.apparent_temperature}({Math.round(attributes?.apparent_temperature)}){/if}{attributes?.temperature_unit || '°'}
				</div>
			{:else}
				<div class="temp">
					{Math.round(attributes?.temperature)}{attributes?.temperature_unit || '°'}
				</div>
			{/if}
		{/if}

		<div class="state">
			{#if weather_sensor && $states?.[weather_sensor]?.state}
				<span>{$states?.[weather_sensor]?.state}</span>
			{:else if entity_state}
				<span>
					{$lang(`weather_${entity_state?.replace('-', '_')}`)}
				</span>
			{/if}
		</div>

		{#if precipitation}
			<div class="rain">
				<div class="inline-icon">
					<Icon icon={extra_sensor_icon || 'mdi:drop'} height="none" />
				</div>
				{#if typeof precipitation === 'string'}
					{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(
						parseFloat(precipitation) / 100
					)}
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<div class="container-empty">
		{$lang('weather')}
	</div>
{/if}

<style>
	.container-empty {
		word-wrap: break-word;
		padding: 0.5em;
		overflow: hidden;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
	}

	.container {
		padding: var(--theme-sidebar-item-padding);
		display: grid;
		grid-template-columns: min-content auto auto;
		grid-template-rows: auto auto;
		grid-template-areas:
			'icon temp rain'
			'icon state state';
		align-items: center;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		overflow: visible;
	}

	.icon {
		grid-area: icon;
		width: 3rem;
		height: 3rem;
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		align-items: flex-start;
		scale: 1.2;
		transform-origin: right;
		margin-right: 0.4rem;
		margin-left: 0.1rem;
	}

	.temp {
		grid-area: temp;
		justify-self: start;
		align-self: end;
		display: flex;
	}

	.state {
		grid-area: state;
		justify-self: start;
		align-self: start;
		display: flex;
		white-space: nowrap;
		width: 100%;
		overflow: hidden;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	span::first-letter {
		text-transform: uppercase;
	}

	span {
		text-overflow: ellipsis;
		overflow: hidden;
	}

	img {
		height: 100%;
	}

	.rain {
		grid-area: rain;
		justify-self: end;
		align-self: end;
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		align-items: flex-end;
	}

	.inline-icon {
		width: 1.22rem;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		gap: -0.5rem;
		display: flex;
		margin-right: 0.1rem;
	}
</style>
