<script lang="ts">
	import { states, lang } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import WheelPicker from '$lib/Components/WheelPicker.svelte';
	import Icon from '@iconify/svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let selected: any;

	$: entity = $states[selected?.entity_id];
	$: attributes = entity?.attributes;

	function handleClick(service: string, to_state: string) {
		const service_data = {
			service: 'climate.set_' + service,
			data: {
				[service]: to_state
			}
		};
		console.debug(JSON.stringify(service_data, null, 2));
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		<h2>{$lang('hvac_modes')}</h2>

		{#if attributes?.hvac_modes}
			<div class="button-container">
				{#each attributes?.hvac_modes as hvacMode}
					<button
						on:click={() => handleClick('hvac_mode', hvacMode)}
						class:selected={hvacMode === entity?.state}
					>
						<div class="icon-test">
							{#if hvacMode === 'off'}
								<Icon icon="mdi:power" height="none" />
							{:else if hvacMode === 'cool'}
								<Icon icon="mdi:snowflake" height="none" />
							{:else if hvacMode === 'fan_only'}
								<Icon icon="mdi:fan" height="none" />
							{/if}
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

		<h2>{$lang('fan_modes')}</h2>

		{#if attributes?.fan_modes}
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

		<h2>{$lang('swing_modes')}</h2>

		{#if attributes?.swing_modes}
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
		pointer-events: none;
	}
</style>
