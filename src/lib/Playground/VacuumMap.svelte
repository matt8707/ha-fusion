<script lang="ts">
	// @ts-nocheck
	import { states } from '$lib/Stores';
	import { onMount } from 'svelte';

	export let id: string;

	// initialize variables
	let entity: any;
	let state: string;
	let src: string;
	// let stream: boolean;
	let interval: ReturnType<typeof setInterval> | undefined;

	// reactive variables
	$: if ($states?.[id]?.last_updated !== entity?.last_updated) entity = $states?.[id];
	$: if (entity?.state !== state) state = entity?.state;

	// $: entity_picture = entity?.attributes?.entity_picture;
	// $: url = entity_picture + '&date=' + Date.now();

	// proxy (cross-origin)
	// const proxy = async () => {
	// 	console.warn('proxy called');
	// 	try {
	// 		const response = await fetch('/api/vacuum_map', {
	// 			method: 'POST',
	// 			body: JSON.stringify({
	// 				url: url
	// 			})
	// 		});
	// 		const blob = await response.blob();
	// 		src = URL.createObjectURL(blob);
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// };

	// stream
	// $: if (entity_picture && url) {
	// 	proxy();
	// 	if (state !== 'idle') {
	// 		stream = true;
	// 	}
	// }

	onMount(() => {
		// HMR
		clearInterval(interval);
	});

	// call proxy every 1000 ms
	// $: if (entity_picture && url && stream) {
	// 	interval = setInterval(proxy, 1000);
	// }

	let items = [
		{ id: 'vacuum.morty', type: 'attributes', attribute: 'battery_level', name: 'Batteri' },
		{
			id: 'sensor.morty_filter_left',
			type: 'state',
			name: 'Filter',
			percent: '5400'
		},
		{
			id: 'sensor.morty_side_brush_left',
			type: 'state',
			name: 'Sidoborste',
			percent: '7200'
		},
		{
			id: 'sensor.morty_main_brush_left',
			type: 'state',
			name: 'Huvudborste',
			percent: '10800'
		},
		{
			id: 'sensor.morty_sensor_dirty_left',
			type: 'state',
			name: 'Sensorer',
			percent: '1080'
		}
	];

	let values = {};

	$: items.forEach((item) => {
		const state = $states?.[item.id];
		values[item.name] =
			item.type === 'state'
				? Math.round(state?.state / item.percent) || 0
				: state?.attributes?.[item.attribute] || 0;
	});

	// $: fan_speed_list = $states?.['vacuum.morty']?.attributes?.fan_speed_list;
	// $: fan_speed = $states?.['vacuum.morty']?.attributes?.fan_speed;

	// service: xiaomi_miio.vacuum_clean_zone
	// data:
	// 	zone:
	// 		- - 23510
	// 			- 25311
	// 			- 25110
	// 			- 26362
	// target:
	// 	entity_id: vacuum.morty

	// let zones = [
	// 	{ name: 'Kök', coordinates: [[14895, 20640, 18409, 24058]] },
	// 	{ name: 'Sovrum', coordinates: [[15208, 17278, 20204, 20980]] },
	// 	{ name: 'Hall', coordinates: [[18170, 20925, 23138, 25026]] },
	// 	{ name: 'Vardagsrum', coordinates: [[21474, 24942, 27269, 28873]] },
	// 	{ name: 'Studio', coordinates: [[17687, 24885, 21487, 28816]] }
	// ];
</script>

<br />

<!-- <h2>fix fan speed like nav bar instead</h2>  -->

<div class="grid-container">
	<div class="bar-card">
		<h2>consumables</h2>
		{#each items as item}
			<div class="container">
				<div class="name ellipsis">
					{item.name}
					{#if !isNaN($states?.[item.id]?.state)}
						({Math.round($states?.[item.id]?.state / 3600)}h)
					{/if}
				</div>
				<div class="bar">
					{#if values[item.name]}
						<div class="number">
							{values[item.name]}%
						</div>
					{/if}
					<div class="fill" style="width: {values[item.name]}%;" />
				</div>
			</div>
		{/each}
	</div>

	<div class="map">
		{#if src}
			<img {src} alt={entity?.attributes?.friendly_name} width="567" draggable="false" />
		{/if}
	</div>
</div>

<style>
	:global(.rangeSlider) {
		font-size: 1.3em;
	}

	.container {
		display: flex;
		margin: 1em 0 1em 0;
		justify-content: space-between;
	}

	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
	}

	.map {
		box-sizing: border-box;

		padding-left: 1em;
	}

	.bar {
		position: relative;
		background-color: #252525;
		border-radius: 0.5em;
		overflow: hidden;
		width: 100%;
	}

	.name {
		font-size: 1.15em;
		color: white;
		align-self: center;
		width: 12em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.number {
		font-size: 1.15em;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fill {
		min-height: 2.5em;
		transition: 800ms ease;
		background-color: #004f47;
	}
</style>
