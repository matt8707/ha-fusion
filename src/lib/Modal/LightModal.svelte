<script lang="ts">
	import { states, selectedLanguage, lang, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import LightSlider from '$lib/Components/LightSlider.svelte';
	import ColorPicker from '$lib/Components/ColorPicker.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Ripple from 'svelte-ripple';
	import { getName } from '$lib/Utils';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: any;

	let debounce = false;
	let timeout: ReturnType<typeof setTimeout>;
	let selTab: string;
	let rangeValue = 0;
	let supportMappings: Record<string, string>;
	let displayMappings: Record<string, string>;

	let entity: HassEntity;
	$: if ($states?.[sel?.entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[sel?.entity_id];
	}

	// color
	$: supportedColorModes = entity?.attributes?.supported_color_modes;
	$: colorMode = entity?.attributes?.color_mode;
	$: tempSelected = selTab === 'temp' || (colorMode === 'color_temp' && selTab !== 'color');
	$: colorSelected = selTab === 'color' || (colorMode === 'xy' && selTab !== 'temp');

	$: current = Math.round(rangeValue / 2.55);
	$: brightness = entity?.attributes?.brightness;

	$: supportMappings = {
		brightness: 'brightness',
		color_temp: 'temp',
		xy: 'color'
	};
	$: displayMappings = {
		brightness: $lang('brightness'),
		color_temp: $lang('color_temp'),
		xy: $lang('color')
	};

	const masterEntity: HassEntity = $states?.[sel?.entity_id];
	let groupSelected: string | undefined;
	if (masterEntity?.entity_id) {
		groupSelected = $states?.[masterEntity.entity_id]?.entity_id;
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>
		{#if masterEntity?.attributes?.entity_id}
			<h2>{$lang('group')}</h2>
			<div class="button-container">
				<button
					class:selected={$states?.[masterEntity?.entity_id]?.entity_id === groupSelected}
					on:click={() => {
						groupSelected = $states?.[masterEntity?.entity_id]?.entity_id;
						sel = $states?.[masterEntity?.entity_id];

						// reset
						clearTimeout(timeout);
						debounce = false;
						rangeValue = brightness || 0;
					}}>{getName(undefined, masterEntity)}</button
				>
				{#each masterEntity?.attributes?.entity_id as groupEntity}
					<button
						class:selected={$states?.[groupEntity]?.entity_id === groupSelected}
						on:click={() => {
							groupSelected = $states?.[groupEntity]?.entity_id;
							sel = $states?.[groupEntity];

							// reset
							clearTimeout(timeout);
							debounce = false;
							rangeValue = brightness || 0;
						}}
					>
						{getName(undefined, $states?.[groupEntity])}
					</button>
				{/each}
			</div>
		{/if}

		<!-- BRIGHTNESS -->
		{#if brightness !== undefined}
			<h2>
				{$lang('brightness')}
				<span class="align-right">
					{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(current / 100)}
				</span>
			</h2>
			<LightSlider {entity} {debounce} {timeout} {brightness} bind:rangeValue bind:current />
		{/if}

		<!-- COLOR -->
		{#if supportedColorModes?.includes('color_temp') || supportedColorModes?.includes('xy')}
			<h2>{$lang('change_color')}</h2>
		{/if}

		{#if supportedColorModes?.length > 1}
			<div class="button-container">
				{#each supportedColorModes as mode, index}
					<button
						class:selected={mode}
						on:click={() => {
							selTab = supportMappings[mode];
						}}
						use:Ripple={$ripple}
					>
						{displayMappings[mode]}
					</button>
				{/each}
			</div>
		{/if}
		{#if supportedColorModes?.includes('color_temp') || supportedColorModes?.includes('xy')}
			<ColorPicker {entity} {colorMode} {supportedColorModes} {tempSelected} {colorSelected} />
		{/if}

		<ConfigButtons />
	</Modal>
{/if}
