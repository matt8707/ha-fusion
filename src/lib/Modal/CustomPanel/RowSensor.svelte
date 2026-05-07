<script lang="ts">
	import { states, lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import type { ModalRowSensor } from '$lib/Types';

	export let row: ModalRowSensor;
	export let configMode = false;

	$: entity = row?.entity_id ? $states[row.entity_id] : undefined;
	$: name = row?.name || entity?.attributes?.friendly_name || row?.entity_id || '—';
	$: state = entity?.state ?? (configMode ? 'unknown' : undefined);
	$: unit = entity?.attributes?.unit_of_measurement ?? '';
	$: prefix = row?.prefix ?? '';
	$: suffix = row?.suffix ?? unit;
	$: missing = !row?.entity_id || (!entity && !configMode);
</script>

{#if !missing || configMode}
	<div class="row-sensor" class:faded={!entity && configMode}>
		<span class="sensor-name">{name}</span>
		<span class="sensor-value">
			{#if state !== undefined}
				{prefix}{$lang(state) || state}{suffix ? '\u00a0' + suffix : ''}
			{:else}
				<Icon icon="mdi:help-circle-outline" height="1rem" />
			{/if}
		</span>
	</div>
{/if}

<style>
	.row-sensor {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 0.2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
	}

	.row-sensor:last-child {
		border-bottom: none;
	}

	.faded {
		opacity: 0.4;
	}

	.sensor-name {
		font-size: 0.9rem;
		opacity: 0.75;
	}

	.sensor-value {
		font-size: 1rem;
		font-weight: 500;
	}
</style>
