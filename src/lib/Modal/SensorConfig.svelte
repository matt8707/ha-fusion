<script lang="ts">
	import {
		dashboard,
		entityList,
		history,
		historyIndex,
		lang,
		record,
		ripple,
		states
	} from '$lib/Stores';
	import { onDestroy, tick } from 'svelte';
	import Sensor from '$lib/Sidebar/Sensor.svelte';
	import Select from '$lib/Components/Select.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { SensorItem } from '$lib/Types';
	import { isTimestamp } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: SensorItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let prefix: string | undefined = sel?.prefix;
	let suffix: string | undefined = sel?.suffix;

	$: entity_id = sel?.entity_id;

	$: date = sel?.date;

	$: options = $entityList('sensor');

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());

	/**
	 * If entity_id changes check if state is a timestamp
	 */

	$: if (entity_id) {
		validate();
	}

	async function validate() {
		await tick();
		if (entity_id && $states) {
			const state = $states?.[entity_id]?.state;

			if (isTimestamp(state)) {
				set('date', true);
			} else {
				set('date');
			}
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('sensor')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Sensor {entity_id} {date} {prefix} {suffix} />
		</div>

		<h2>{$lang('entity')}</h2>

		{#if sel && options}
			<Select
				computeIcons={true}
				{options}
				placeholder={$lang('sensor')}
				value={entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('before')}</h2>

		<InputClear
			condition={prefix}
			on:clear={() => {
				prefix = undefined;
				set('prefix');
			}}
			let:padding
		>
			<input
				id="sensor_prefix"
				class="input"
				type="text"
				bind:value={prefix}
				placeholder="Prefix"
				on:change={(event) => set('prefix', event)}
				style:padding
				autocomplete="off"
				spellcheck="false"
			/>
		</InputClear>

		<h2>{$lang('after')}</h2>

		<InputClear
			condition={suffix}
			on:clear={() => {
				suffix = undefined;
				set('suffix');
			}}
			let:padding
		>
			<input
				id="sensor_suffix"
				class="input"
				type="text"
				bind:value={suffix}
				placeholder="Suffix"
				on:change={(event) => set('suffix', event)}
				style:padding
				autocomplete="off"
				spellcheck="false"
			/>
		</InputClear>

		<h2>{$lang('date')}</h2>

		<div class="button-container">
			<button class:selected={!sel?.date} on:click={() => set('date', false)} use:Ripple={$ripple}>
				{$lang('no')}
			</button>

			<button class:selected={sel?.date} on:click={() => set('date', true)} use:Ripple={$ripple}>
				{$lang('yes')}
			</button>
		</div>

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
