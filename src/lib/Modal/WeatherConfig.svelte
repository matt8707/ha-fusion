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
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let icon: string | undefined = sel?.icon;

	$: entity = sel?.entity_id && ($states?.[sel?.entity_id] as any);
	$: attributes = entity && entity?.attributes;

	const iconOptions = [{ id: 'meteocons', label: 'meteocons' }];

	$: options = $entityList('weather');

	$: sensorOptions = Object.keys($states)
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
			<Weather {sel} />
		</div>

		<h2>{$lang('entity')}</h2>

		{#if options}
			<Select
				computeIcons={true}
				{options}
				placeholder={$lang('entity')}
				value={sel?.entity_id}
				defaultIcon="mdi:weather-cloudy"
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('state')}</h2>

		{#if sensorOptions}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				options={sensorOptions}
				placeholder="{$lang('state')} ({$lang('optional')})"
				value={sel?.state}
				on:change={(event) => set('state', event)}
				clearable={true}
			/>
		{/if}

		<h2>{$lang('icons')}</h2>

		{#if iconOptions}
			<Select
				options={iconOptions}
				placeholder={$lang('icon')}
				value={sel?.icon_pack || 'meteocons'}
				on:change={(event) => set('icon_pack', event)}
			/>
		{/if}

		<h2>{$lang('sensor')}</h2>

		{#if sensorOptions}
			<Select
				computeIcons={true}
				defaultIcon="mdi:weather-cloudy"
				options={sensorOptions}
				placeholder="{$lang('sensor')} ({$lang('optional')})"
				value={sel?.sensor}
				on:change={(event) => set('sensor', event)}
				clearable={true}
			/>
		{/if}

		<h2>
			{$lang('icon')}
		</h2>

		<div class="icon-gallery-container">
			<InputClear
				condition={icon}
				on:clear={() => {
					icon = undefined;
					set('icon');
				}}
				let:padding
			>
				<input
					class="input"
					type="text"
					placeholder="codicon:blank"
					bind:value={icon}
					on:change={(event) => set('icon', event)}
					style:padding
					autocomplete="off"
					spellcheck="false"
				/>
			</InputClear>

			<button
				use:Ripple={$ripple}
				title={$lang('icon')}
				class="icon-gallery"
				on:click={() => {
					window.open('https://icon-sets.iconify.design/', '_blank');
				}}
				style:padding="0.84rem"
			>
				<Icon icon="majesticons:open-line" height="none" />
			</button>
		</div>

		{#if attributes?.apparent_temperature}
			<h2>{$lang('apparent_temperature')}</h2>

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
