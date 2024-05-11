<script lang="ts">
	import { editMode, lang, selectedLanguage, states } from '$lib/Stores';
	import { getDomain, isTimestamp, relativeTime } from '$lib/Utils';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let selected: any;
	export let contentWidth: number | undefined = undefined;
	export let entity_id: string | undefined;

	let entity: HassEntity;

	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated)
		entity = $states?.[entity_id];

	$: attributes = entity?.attributes;
	$: state = entity?.state;
	$: brightness = attributes?.brightness;
	$: percentage = attributes?.percentage;
	$: media_title = attributes?.media_title;
</script>

<!-- Light -->
{#if selected?.attribute}
	{entity?.attributes[selected?.attribute]}
{:else if state === 'on' && brightness}
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

	<!-- Climate -->
{:else if getDomain(entity_id) === 'climate' && attributes?.hvac_action}
	{$lang(attributes?.hvac_action)}

	<!-- Climate -->
{:else if getDomain(entity_id) === 'update'}
	{#if attributes?.in_progress}
		{typeof attributes?.in_progress === 'number'
			? $lang('update_installing_progress').replace('{progress}', String(attributes?.in_progress))
			: $lang('update_installing')}
	{:else if state === 'on'}
		{$lang('update_available')}
	{:else if state === 'off'}
		{$lang('update_up_to_date')}
	{/if}

	<!-- Automation -->
{:else if getDomain(entity_id) === 'automation' && entity?.attributes?.current > 0}
	{$lang('running')}

	<!-- Script -->
{:else if getDomain(entity_id) === 'script' && entity?.attributes?.current > 0}
	{$lang('running')}

	<!-- Humidifier -->
{:else if getDomain(entity_id) === 'humidifier' && state === 'on' && attributes?.action}
	{$lang('humidifier_' + attributes?.action)}

	<!-- Water Heater -->
{:else if getDomain(entity_id) === 'water_heater'}
	{$lang('water_heater_' + state)}

	<!-- Input Number / Number -->
{:else if entity_id && (getDomain(entity_id) === 'input_number' || getDomain(entity_id) === 'number')}
	{Number(state) || $lang('unknown')}
	{#if attributes?.unit_of_measurement}{attributes.unit_of_measurement}{/if}

	<!-- Weather -->
{:else if getDomain(entity_id) === 'weather'}
	{$lang('weather_' + state?.replace('_', '-')) || state || $lang('unknown')}

	<!-- Text -->
{:else if getDomain(entity_id) === 'input_text' || getDomain(entity_id) === 'text'}
	{#if state === 'unknown'}
		{$lang('unknown')}
	{:else if state === ''}
		{@html '&nbsp;'}
	{:else}
		{attributes?.mode === 'password' ? state.replace(/./g, '•') : state}
	{/if}

	<!-- Timestamp  -->
{:else if state && isTimestamp(state)}
	{relativeTime(state, $selectedLanguage)}

	<!-- Percentage  -->
{:else if state === 'on' && percentage}
	{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(percentage * 0.01)}

	<!-- State  -->
{:else if state}
	{#if selected?.marquee && contentWidth && contentWidth > 153 && !$editMode}
		{#await import('$lib/Components/Marquee.svelte') then Marquee}
			<svelte:component this={Marquee.default}>
				{@html $lang(state)}

				<!-- Unit -->
				{#if attributes?.unit_of_measurement}
					{attributes.unit_of_measurement}
				{/if}
				{@html '&nbsp;'.repeat(4)}
			</svelte:component>
		{/await}
	{:else}
		{@html $lang(state)}

		<!-- Unit -->
		{#if attributes?.unit_of_measurement}
			{attributes.unit_of_measurement}
		{/if}
	{/if}
{:else}
	{$lang('unknown')}
{/if}
