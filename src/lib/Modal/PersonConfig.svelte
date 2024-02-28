<script lang="ts">
	import { dashboard, history, historyIndex, lang, record, ripple, states } from '$lib/Stores';
	import { onDestroy, tick } from 'svelte';
	import Person from '$lib/Sidebar/Person.svelte';
	import Select from '$lib/Components/Select.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { PersonItem } from '$lib/Types';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean;
	export let sel: PersonItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
		set('entity_id_2', demo);
	}
//	let battery_level_sensor_icon: string | undefined = sel?.battery_level_sensor_icon;
//	let battery_level_sensor: string | undefined = sel?.battery_level_sensor;

	const iconOptions = [{ id: 'meteocons', name: 'meteocons' }];

	$: personStates = Object.keys($states)
		.filter((key) => key.startsWith('person.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	$: sensorStates = Object.keys($states)
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
		<h1 slot="title">{$lang('person')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Person 
				entity_id={sel?.entity_id}
				battery_level_sensor={sel?.battery_level_sensor}
				entity_id_2={sel?.entity_id_2}
				battery_level_sensor_2={sel?.battery_level_sensor_2}
			/>	
		</div>

		<h2>{$lang('entity')} {$lang('person')} 1</h2>

		{#if personStates}
			<Select
				customItems={true}
				options={personStates}
				placeholder={$lang('person')}
				value={sel?.entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('battery_level')} {$lang('person')} 1</h2>

		{#if sensorStates}
			<Select
				customItems={true}
				options={sensorStates}
				placeholder={$lang('sensor')}
				value={sel?.battery_level_sensor}
				on:change={(event) => set('battery_level_sensor', event)}
			/>
		{/if}

		<h2>{$lang('entity')} {$lang('person')} 2</h2>

		{#if personStates}
			<Select
				customItems={true}
				options={personStates}
				placeholder={$lang('person')}
				value={sel?.entity_id_2}
				on:change={(event) => set('entity_id_2', event)}
			/>
		{/if}					
		<h2>{$lang('battery_level')} {$lang('person')} 2</h2>	

		{#if sensorStates}
			<Select
				customItems={true}
				options={sensorStates}
				placeholder={$lang('sensor')}
				value={sel?.battery_level_sensor_2}
				on:change={(event) => set('battery_level_sensor_2', event)}
			/>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}
