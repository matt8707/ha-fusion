<script lang="ts">
	import { states, dashboard, lang, record, history, historyIndex } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import History from '$lib/Sidebar/History.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { HistoryItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: HistoryItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: options = Object.keys($states)
		.sort()
		.map((key) => ({ id: key, label: key }));

	const periodOptions = [
		{ id: '5minute', name: $lang('period_5minute') },
		{ id: 'hour', name: $lang('period_hour') },
		{ id: 'day', name: $lang('period_day') },
		{ id: 'week', name: $lang('period_week') },
		{ id: 'month', name: $lang('period_month') }
	];

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('history')}</h1>

		<h2>{$lang('preview')}</h2>

		{#if sel?.entity_id}
			<div class="preview">
				<History entity_id={sel.entity_id} period={sel?.period} />
			</div>
		{/if}

		<h2>{$lang('entity')}</h2>

		{#if sel}
			<Select
				{options}
				placeholder={$lang('entity')}
				value={sel.entity_id}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('period')}</h2>

		{#if sel && periodOptions}
			<Select
				options={periodOptions}
				placeholder={$lang('period')}
				value={sel?.period || 'hour'}
				on:change={(event) => set('period', event)}
			/>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}
