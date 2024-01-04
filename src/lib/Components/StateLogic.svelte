<script lang="ts">
	import { states, lang, selectedLanguage, editMode } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { isTimestamp, relativeTime } from '$lib/Utils';
	import { getDomain } from '$lib/Utils';

	export let selected: any;
	export let contentWidth: number | undefined = undefined;
	export let entity_id: string | undefined;

	let entity: HassEntity;

	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated)
		entity = $states?.[entity_id];

	$: attributes = entity?.attributes;
	$: state = entity?.state;
	$: brightness = attributes?.brightness;
	$: media_title = attributes?.media_title;
</script>

<!-- Light -->
{#if state === 'on' && brightness}
	{@const percentage = brightness / 255}
	<!-- should never be 0% if on -->
	{@const floor = percentage < 0.01 && percentage > 0 ? 0.01 : percentage}
	{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(floor)}

	<!-- Media -->
{:else if media_title && state === 'playing'}
	{@const title = `<span title=${media_title}>${media_title}</span>`}
	{#if selected?.marquee === true && contentWidth && contentWidth > 153 && !$editMode}
		{#await import('$lib/Components/Marquee.svelte')}
			{@html title}
		{:then Marquee}
			<svelte:component this={Marquee.default}>
				{media_title}
				{@html '&nbsp;'.repeat(4)}
			</svelte:component>
		{/await}
	{:else}
		{@html title}
	{/if}

	<!--  Timer -->
{:else if entity_id && entity_id.split('.')[0] === 'timer'}
	handle timer logic

	<!--  Input Number / Number -->
{:else if entity_id && (getDomain(entity_id) === 'input_number' || getDomain(entity_id) === 'number')}
	{Number(state) || $lang('unknown')}
	{#if attributes?.unit_of_measurement}{attributes.unit_of_measurement}{/if}

	<!--  Camera -->
{:else if entity_id && entity_id.split('.')[0] === 'camera'}
	<!-- instead of idle? -->
	{$lang('camera')}

	<!--  Climate -->
{:else if entity_id && entity_id.split('.')[0] === 'climate'}
	{#if state === 'fan_only' || state == 'dry' || state === 'off' || attributes?.hvac_action === 'idle'}
		{@html $lang(state) || state}
	{:else}
		{@html $lang(attributes?.hvac_action) || attributes?.hvac_action}
	{/if}

	<!--  Weather -->
{:else if entity_id && entity_id.split('.')[0] === 'weather'}
	{$lang('weather_' + state?.replace('_', '-')) || state || $lang('unknown')}

	<!-- Timestamp  -->
{:else if state && isTimestamp(state)}
	{relativeTime(state, $selectedLanguage)}

	<!-- State  -->
{:else if state}
	{#if selected?.marquee && contentWidth && contentWidth > 153 && !$editMode}
		{#await import('$lib/Components/Marquee.svelte') then Marquee}
			<svelte:component this={Marquee.default}>
				{@html $lang(state) || state}
				<!-- Unit -->
				{#if attributes?.unit_of_measurement}
					{attributes.unit_of_measurement}
				{/if}
				{@html '&nbsp;'.repeat(4)}
			</svelte:component>
		{/await}
	{:else}
		{@html $lang(state) || state}
		<!-- Unit -->
		{#if attributes?.unit_of_measurement}
			{attributes.unit_of_measurement}
		{/if}
	{/if}
{:else}
	{$lang('unknown')}
{/if}
