<script lang="ts">
	import { connection, lang, states, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import Select from '$lib/Components/Select.svelte';
	import { callService } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: state = entity?.state;
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		TURN_ON: 1,
		TURN_OFF: 2,
		PAUSE: 4,
		STOP: 8,
		RETURN_HOME: 16,
		FAN_SPEED: 32,
		BATTERY: 64,
		STATUS: 128,
		SEND_COMMAND: 256,
		LOCATE: 512,
		CLEAN_SPOT: 1024,
		MAP: 2048,
		STATE: 4096,
		START: 8192
	});

	$: options = attributes?.fan_speed_list?.map((option: string) => ({
		id: option,
		label: $lang(option?.toLowerCase())
	}));

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
			{$lang(state)}
			<br />

			{#if supports?.BATTERY}
				<h2>{$lang('battery')}</h2>
				{attributes?.battery_level} %
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

		{#if supports?.TURN_ON || supports?.TURN_OFF || supports?.START || supports?.PAUSE || supports?.STOP || supports?.LOCATE || supports?.RETURN_HOME}
			<h2>{$lang('vacuum_commands')?.replace(':', '')}</h2>
		{/if}

		<div class="button-container">
			{#if supports?.TURN_ON}
				<button
					title={$lang('on')}
					class:selected={entity?.state === 'on'}
					on:click={() => handleClick('turn_on')}
					use:Ripple={$ripple}
				>
					<div class="icon" style="transform: scale(0.7);">
						<Icon icon="mdi:power-on" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.TURN_OFF}
				<button
					title={$lang('off')}
					class:selected={entity?.state === 'off'}
					on:click={() => handleClick('turn_off')}
					use:Ripple={$ripple}
				>
					<div class="icon" style="transform: scale(0.7);">
						<Icon icon="mdi:power-off" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.START}
				<button
					title={$lang('start')}
					class:selected={entity?.state === 'cleaning'}
					on:click={() => handleClick('start')}
					use:Ripple={$ripple}
				>
					<div class="icon">
						<Icon icon="ic:round-play-arrow" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.PAUSE}
				<button
					title={$lang('pause')}
					class:selected={entity?.state === 'paused'}
					on:click={() => handleClick('pause')}
					use:Ripple={$ripple}
				>
					<div class="icon">
						<Icon icon="ic:round-pause" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.STOP}
				<button
					title={$lang('stop')}
					class:selected={entity?.state === 'idle'}
					on:click={() => handleClick('stop')}
					use:Ripple={$ripple}
				>
					<div class="icon">
						<Icon icon="ic:round-stop" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.LOCATE}
				<button title={$lang('locate')} on:click={() => handleClick('locate')} use:Ripple={$ripple}>
					<div class="icon" style="transform: scale(0.65);">
						<Icon icon="fa:search" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.RETURN_HOME}
				<button
					title={$lang('return_home')}
					class:selected={entity?.state === 'returning'}
					on:click={() => handleClick('return_to_base')}
					use:Ripple={$ripple}
				>
					<div class="icon" style="transform: scale(0.85);">
						<Icon icon="ic:round-home" height="none" />
					</div>
				</button>
			{/if}
		</div>

		<!-- <h2>Supports</h2>

		{#each Object.entries(supports) as [feature, supported]}
			<div>{feature}: {supported}</div>
		{/each} -->

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.button-container > button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		width: 1.6rem;
		height: 1.6rem;
	}
</style>
