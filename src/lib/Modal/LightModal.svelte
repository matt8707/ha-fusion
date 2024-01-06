<script lang="ts">
	import { states, selectedLanguage, lang, ripple, connection } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import LightSlider from '$lib/Components/LightSlider.svelte';
	import ColorPicker from '$lib/Components/ColorPicker.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Ripple from 'svelte-ripple';
	import { getName } from '$lib/Utils';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import Toggle from '$lib/Components/Toggle.svelte';

	export let isOpen: boolean;
	export let sel: any;

	let debounce = false;
	let timeout: ReturnType<typeof setTimeout>;
	let rangeValue = 0;

	let entity: HassEntity;
	$: if ($states?.[sel?.entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[sel?.entity_id];
	}

	const supportMappings: Record<string, string> = {
		brightness: 'brightness',
		color_temp: 'color_temp',
		rgbw: 'color',
		xy: 'color'
	};

	const displayMappings: Record<string, string> = {
		brightness: $lang('brightness'),
		color_temp: $lang('color_temp'),
		rgbw: $lang('color'),
		xy: $lang('color')
	};

	//color
	let supportedColorModes: string | any[] = [];
	$: toggle = entity?.state === 'on';
	$: colorModes = entity?.attributes?.supported_color_modes;
	$: if (Array.isArray(colorModes)) {
		supportedColorModes = colorModes.filter((m) => m !== 'brightness');
	} else if (typeof colorModes === 'string') {
		if (colorModes !== 'brightness') {
			supportedColorModes = [colorModes];
		}
	}

	$: colorMode = entity?.attributes?.color_mode;
	$: selTab = supportMappings?.[colorMode];

	$: current = Math.round(rangeValue / 2.55);
	$: brightness = entity?.attributes?.brightness;

	const masterEntity: HassEntity = $states?.[sel?.entity_id];
	let groupSelected: string | undefined;
	if (masterEntity?.entity_id) {
		groupSelected = $states?.[masterEntity.entity_id]?.entity_id;
	}

	/**
	 * Calls light.toggle service
	 */
	function handleClick() {
		callService($connection, 'light', 'toggle', {
			entity_id: entity?.entity_id
		});
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

		<!-- ONOFF -->
		{#if supportedColorModes?.includes('onoff')}
			<h2>{$lang('toggle')}</h2>

			<Toggle bind:checked={toggle} on:change={handleClick} />
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
		{#if supportedColorModes?.includes('color_temp') || supportedColorModes?.includes('xy') || supportedColorModes?.includes('rgbw')}
			<h2>{$lang('change_color')}</h2>
		{/if}

		{#if supportedColorModes?.length > 1}
			<div class="button-container">
				{#each supportedColorModes as mode}
					<button
						class:selected={selTab === supportMappings?.[mode]}
						on:click={() => {
							selTab = supportMappings?.[mode];
						}}
						use:Ripple={$ripple}
					>
						{displayMappings?.[mode]}
					</button>
				{/each}
			</div>
		{/if}
		{#if supportedColorModes?.includes('color_temp') || supportedColorModes?.includes('xy') || supportedColorModes?.includes('rgbw')}
			<ColorPicker
				{entity}
				{colorMode}
				{supportedColorModes}
				tempSelected={selTab === 'color_temp'}
				colorSelected={selTab === 'color'}
			/>
		{/if}

		<ConfigButtons />
	</Modal>
{/if}
