<script lang="ts">
	import { states, lang, connection, selectedLanguage } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Select from '$lib/Components/Select.svelte';
	import Toggle from '$lib/Components/Toggle.svelte';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states?.[sel?.entity_id];
	$: attr = entity?.attributes;
	$: toggle = entity?.state === 'on';

	$: options = attr?.available_modes?.map((option: string) => ({
		id: option,
		icon: icons?.[option] || 'mdi:water-percent',
		label: $lang(`humidifier_mode_${option}`)
	}));

	const icons: Record<string, string> = {
		auto: 'mdi:refresh-auto',
		away: 'mdi:account-arrow-right',
		baby: 'mdi:baby-carriage',
		boost: 'mdi:rocket-launch',
		comfort: 'mdi:sofa',
		eco: 'mdi:leaf',
		home: 'mdi:home',
		normal: 'mdi:water-percent',
		sleep: 'mdi:power-sleep'
	};

	/**
	 * Handle service calls
	 * 'toggle' | 'set_humidity' | 'set_mode'
	 */
	function handleEvent(service: string, payload: number | string | undefined = undefined) {
		if (!entity?.entity_id) return;

		let data: any = {
			entity_id: entity?.entity_id
		};

		if (service === 'set_humidity') {
			data.humidity = payload;
		} else if (service === 'set_mode') {
			data.mode = payload;
		}

		callService($connection, 'humidifier', service, data);
	}

	/**
	 * Formats percent to locale
	 */
	function format(value: number) {
		if (!value) return;

		return Intl.NumberFormat($selectedLanguage, {
			style: 'percent'
		}).format(value / 100);
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<!-- TOGGLE -->
		<h2>{$lang('toggle')}</h2>

		<Toggle bind:checked={toggle} on:change={() => handleEvent('toggle')} />

		<!-- STATE -->
		<h2>{$lang('state')}</h2>

		{#if entity?.state === 'on' && attr?.action}
			{$lang('humidifier_' + attr?.action)}
		{:else}
			<StateLogic entity_id={sel?.entity_id} selected={sel} />
		{/if}

		<!-- HUMIDITY -->
		<h2>
			{$lang('target_humidity')}

			<span class="align-right">
				{#if attr?.current_humidity}
					{format(attr?.current_humidity)} ->
				{/if}

				{format(attr?.humidity)}
			</span>
		</h2>

		<RangeSlider
			bind:value={attr.humidity}
			min={attr?.min_humidity}
			max={attr?.max_humidity}
			on:change={(event) => {
				handleEvent('set_humidity', event?.detail);
			}}
		/>

		<!-- MODE  -->
		<!-- attributes?.supported_features === 1 -->
		{#if options}
			<h2>
				{$lang('mode')}
			</h2>

			<Select
				{options}
				placeholder={$lang('mode')}
				value={attr?.mode}
				on:change={(event) => {
					handleEvent('set_mode', event?.detail);
				}}
			/>
		{/if}

		<!-- <h2>Dev</h2>

		<code>
			<pre>
{JSON.stringify(entity, null, 2)}
			</pre>
		</code> -->

		<ConfigButtons />
	</Modal>
{/if}
