<script lang="ts">
	import { connection, lang, states, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import Select from '$lib/Components/Select.svelte';
	import { callService } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: state = entity?.state;
	$: attributes = entity?.attributes;

	$: options = attributes?.fan_speed_list?.map((option: string) => ({
		id: option,
		label: $lang(option?.toLowerCase())
	}));

	/**
	 * Construct support based on Feature
	 * https://github.com/home-assistant/frontend/blob/dev/src/data/vacuum.ts
	 */

	let supports: { [key: string]: boolean } = {};

	enum Feature {
		TURN_ON = 1,
		TURN_OFF = 2,
		PAUSE = 4,
		STOP = 8,
		RETURN_HOME = 16,
		FAN_SPEED = 32,
		BATTERY = 64,
		STATUS = 128,
		SEND_COMMAND = 256,
		LOCATE = 512,
		CLEAN_SPOT = 1024,
		MAP = 2048,
		STATE = 4096,
		START = 8192
	}

	$: if (sel?.entity_id) constructSupports();

	function constructSupports() {
		if (!attributes) return;

		Object.keys(Feature)
			.filter((key) => isNaN(Number(key)))
			.forEach((key) => {
				supports[key] = getSupport(attributes, Feature[key as keyof typeof Feature]);
			});
	}

	/**
	 * Handle click
	 */
	function handleClick(service: string) {
		callService($connection, 'vacuum', service, {
			entity_id: entity?.entity_id
		});
	}

	/**
	 * Handle change 'set_fan_speed'
	 */
	function handleChange(fan_speed: string) {
		callService($connection, 'vacuum', 'set_fan_speed', {
			entity_id: entity?.entity_id,
			fan_speed
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('state')}</h2>

		{#if entity}
			STATE: {state}
			<br />
			STATUS: {entity?.attributes?.status}
			<br />
			{#if supports?.BATTERY}
				BATTERY: {attributes?.battery_level} %
			{/if}
		{/if}

		{#if supports?.FAN_SPEED && options}
			<h2>{$lang('fan_speed')}</h2>

			<Select
				{options}
				placeholder={$lang('options')}
				value={attributes?.fan_speed}
				on:change={(event) => handleChange(event?.detail)}
			/>
		{/if}

		<h2>{$lang('buttons')}</h2>

		<div>
			<button class="action" on:click={() => handleClick('start')} use:Ripple={$ripple}>
				{$lang('start')}
			</button>

			<button class="action" on:click={() => handleClick('pause')} use:Ripple={$ripple}>
				{$lang('pause')}
			</button>

			<button class="action" on:click={() => handleClick('stop')} use:Ripple={$ripple}>
				{$lang('stop')}
			</button>

			<button class="action" on:click={() => handleClick('locate')} use:Ripple={$ripple}>
				{$lang('locate')}
			</button>

			<button
				class="action"
				on:click={() => handleClick('return_to_base')}
				use:Ripple={$ripple}
				style:opacity={state === 'docked' ? '0.2' : '1'}
			>
				{$lang('return_home')}
			</button>
		</div>

		<h2>Attributes</h2>

		<pre>{JSON.stringify(entity, null, 2)}</pre>

		<h2>Supports</h2>

		{#each Object.entries(supports) as [feature, supported]}
			<div>{feature}: {supported}</div>
		{/each}

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.action {
		color: black !important;
		margin: 0.2rem;
	}
</style>
