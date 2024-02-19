<script lang="ts">
	import {
		dashboard,
		states,
		connection,
		lang,
		history,
		historyIndex,
		record,
		ripple
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Graph from '$lib/Sidebar/Graph.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj, getName } from '$lib/Utils';
	import type { GraphItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: GraphItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let name = sel?.name;

	let options: { id: string; label: string }[];
	let stroke = sel?.stroke;

	let numberElement: HTMLInputElement;

	const range = {
		min: 0,
		max: 10
	};

	const periodOptions = [
		{ id: '5minute', label: $lang('period_5minute') },
		{ id: 'hour', label: $lang('period_hour') },
		{ id: 'day', label: $lang('period_day') },
		{ id: 'week', label: $lang('period_week') },
		{ id: 'month', label: $lang('period_month') }
	];

	function minMax(key: string | number | undefined) {
		return Math.min(Math.max(parseInt(key as string), range.min), range.max);
	}

	function handleNumberRange(event: any) {
		const value = minMax(event?.target?.value);
		set('stroke', value);
		if (numberElement) numberElement.value = String(value);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());

	connection.subscribe(async (conn) => {
		if (!conn) return;

		try {
			const [res1, res2]: [any, any] = await Promise.all([
				conn.sendMessagePromise({ type: 'recorder/list_statistic_ids' }),
				conn.sendMessagePromise({ type: 'recorder/validate_statistics' })
			]);

			const list_statistic_ids = Object.values(res1)
				.map((entry: any) =>
					entry?.statistic_id?.startsWith('sensor.') ? entry.statistic_id : null
				)
				.filter(Boolean);

			const validate_statistics_set = new Set(
				Object.values(res2)
					.map((entry: any) => entry[0]?.data?.statistic_id)
					.filter(Boolean)
			);

			options = list_statistic_ids
				.filter((id) => !validate_statistics_set.has(id))
				.map((item) => ({ id: item, label: item }));
		} catch (err) {
			console.error(err);
		}
	});
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('graph')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Graph
				entity_id={sel?.entity_id}
				name={sel?.name}
				period={sel?.period}
				stroke={minMax(stroke)}
			/>
		</div>

		<h2>{$lang('entity')}</h2>

		{#if options}
			<Select
				computeIcons={true}
				{options}
				placeholder={$lang('sensor')}
				value={sel.entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('name')}</h2>

		<InputClear
			condition={name}
			on:clear={() => {
				name = undefined;
				set('name');
			}}
			let:padding
		>
			<input
				name={$lang('name')}
				class="input"
				type="text"
				placeholder={getName(sel, (sel.entity_id && $states[sel.entity_id]) || undefined) ||
					$lang('name')}
				autocomplete="off"
				spellcheck="false"
				bind:value={name}
				on:change={(event) => set('name', event)}
				style:padding
			/>
		</InputClear>

		<h2>{$lang('period')} (data_points)</h2>

		{#if periodOptions}
			<Select
				options={periodOptions}
				placeholder={$lang('period')}
				value={sel?.period}
				on:change={(event) => set('period', event)}
			/>
		{/if}

		<h2>start_time</h2>

		<input
			class="input"
			type="text"
			placeholder={new Date(Date.now() - 2629800 * 1000).toISOString()}
			autocomplete="off"
			spellcheck="false"
		/>

		<h2>end_time</h2>

		<input
			class="input"
			type="text"
			placeholder={new Date().toISOString()}
			autocomplete="off"
			spellcheck="false"
		/>

		<h2>{$lang('size')}</h2>

		<input
			class="input"
			type="number"
			placeholder="2"
			on:input={handleNumberRange}
			bind:value={stroke}
			bind:this={numberElement}
			min={range.min}
			max={range.max}
		/>

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

<style>
	.preview {
		height: 9rem;
	}
</style>
