<script lang="ts">
	import { states, lang, connection } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import WheelPicker from '$lib/Components/WheelPicker.svelte';
	import Icon from '@iconify/svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let selected: any;

	$: entity = $states[selected?.entity_id];
	$: entity_id = entity?.entity_id;
	$: attributes = entity?.attributes;

	function handleClick(service: string, to_state: string) {
		callService($connection, 'climate', 'set_' + service, {
			entity_id,
			[service]: to_state
		});

		console.debug('climate.set_' + service, '->', to_state);
	}

	const hvacModesIcons: Record<string, string> = {
		auto: 'mdi:thermostat-auto',
		heat: 'mdi:fire',
		heat_cool: 'mdi:sun-snowflake-variant',
		cool: 'mdi:snowflake',
		dry: 'mdi:water-percent',
		off: 'mdi:power',
		fan_only: 'mdi:fan'
	};
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		{#if attributes?.hvac_modes}
			<h2>{$lang('hvac_modes')}</h2>

			<div class="button-container">
				{#each attributes?.hvac_modes as hvacMode}
					<button
						title={$lang(hvacMode)}
						on:click={() => handleClick('hvac_mode', hvacMode)}
						class:selected={hvacMode === entity?.state}
					>
						<div class="icon-test">
							<Icon icon={hvacModesIcons?.[hvacMode]} height="none" />
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<br />

		<WheelPicker
			stateObj={entity}
			on:change={(event) => {
				handleClick('temperature', event?.detail);
			}}
		/>

		{#if attributes?.fan_modes}
			<h2>{$lang('fan_modes')}</h2>

			<div class="button-container">
				{#each attributes?.fan_modes as fanMode}
					<button
						on:click={() => handleClick('fan_mode', fanMode)}
						class:selected={attributes?.fan_mode === fanMode}
					>
						{$lang(fanMode)}
					</button>
				{/each}
			</div>
		{/if}

		{#if attributes?.swing_modes}
			<h2>{$lang('swing_modes')}</h2>

			<div class="button-container">
				{#each attributes?.swing_modes as swingMode}
					<button
						on:click={() => handleClick('swing_mode', swingMode)}
						class:selected={attributes?.swing_mode === swingMode}
					>
						{$lang(swingMode)}
					</button>
				{/each}
			</div>
		{/if}

		<br />

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.icon-test {
		height: 1.25rem;
		width: 1.25rem;
		margin-right: 0.25rem;
		vertical-align: middle;
		display: inline-block;
		color: inherit;
	}
</style>
