<script lang="ts">
	import { states, lang } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import Icon from '@iconify/svelte';

	export let sel: any;

	let entity: HassEntity;
	$: if (sel?.entity_id && $states?.[sel?.entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[sel?.entity_id];
	}

	$: attributes = entity?.attributes;

	// icon pack
	$: below_horizon = $states?.['sun.sun']?.state === 'below_horizon';
	$: src = `weather/meteocons/${entity?.state}-${below_horizon ? 'night' : 'day'}.svg`;

	// sensor
	$: sensor = sel?.sensor && $states?.[sel?.sensor];
</script>

{#if entity && entity?.state !== 'unavailable'}
	<div class="container">
		<div class="icon">
			<img {src} width="100%" height="100%" alt="" />
		</div>

		{#if attributes?.temperature}
			<div class="temperature">
				{#if sel?.show_apparent}
					{Math.round(attributes?.temperature)}{#if attributes.apparent_temperature}({Math.round(
							attributes?.apparent_temperature
						)}){/if}{attributes?.temperature_unit || '°'}
				{:else}
					{Math.round(attributes?.temperature)}{attributes?.temperature_unit || '°'}
				{/if}
			</div>
		{/if}

		<div class="state">
			{#if sel?.state && $states?.[sel?.state]?.state}
				<span>{$states?.[sel?.state]?.state}</span>
			{:else if entity?.state}
				<span>
					{$lang(`weather_${entity?.state?.replace('-', '_')}`)}
				</span>
			{/if}
		</div>

		{#if sensor}
			<div class="sensor">
				<div class="sensor-icon">
					<Icon icon={sel?.icon || 'codicon:blank'} height="none" />
				</div>

				{sensor?.state}
				{#if sensor?.attributes?.unit_of_measurement}
					{sensor?.attributes?.unit_of_measurement}
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<div class="empty">
		{$lang('weather')}
	</div>
{/if}

<style>
	.empty {
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
			'icon temperature sensor'
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

	.temperature {
		grid-area: temperature;
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

	.sensor {
		grid-area: sensor;
		justify-self: end;
		align-self: end;
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		align-items: flex-end;
	}

	.sensor-icon {
		width: 1.22rem;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		display: flex;
		margin-right: 0.2rem;
		align-self: center;
	}
</style>
