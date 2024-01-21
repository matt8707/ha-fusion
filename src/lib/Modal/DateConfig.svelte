<script lang="ts">
	import { dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Date from '$lib/Sidebar/Date.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { DateItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: DateItem;

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('date')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Date short_day={sel?.short_day} short_month={sel?.short_month} hide={sel?.hide} />
		</div>

		<!-- DAY -->
		<h2>{$lang('day')}</h2>
		<div class="button-container">
			<button
				class:selected={!sel?.short_day}
				on:click={() => set('short_day', false)}
				use:Ripple={$ripple}
			>
				{$lang('max_length')}
			</button>
			<button
				class:selected={sel?.short_day}
				on:click={() => set('short_day', true)}
				use:Ripple={$ripple}
			>
				{$lang('min_length')}
			</button>
		</div>

		<!-- MONTH -->
		<h2>{$lang('month')}</h2>
		<div class="button-container">
			<button
				class:selected={!sel?.short_month}
				on:click={() => set('short_month', false)}
				use:Ripple={$ripple}
			>
				{$lang('max_length')}
			</button>
			<button
				class:selected={sel?.short_month}
				on:click={() => set('short_month', true)}
				use:Ripple={$ripple}
			>
				{$lang('min_length')}
			</button>
		</div>

		<!-- HIDE -->
		<h2>{$lang('hide')}</h2>
		<div class="button-container">
			<button
				class:selected={!sel?.hide || sel?.hide === 'none'}
				on:click={() => set('hide', 'none')}
				use:Ripple={$ripple}
			>
				{$lang('none')}
			</button>
			<button
				class:selected={sel?.hide === 'day'}
				on:click={() => set('hide', 'day')}
				use:Ripple={$ripple}
			>
				{$lang('day')}
			</button>
			<button
				class:selected={sel?.hide === 'month'}
				on:click={() => set('hide', 'month')}
				use:Ripple={$ripple}
			>
				{$lang('month')}
			</button>
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	.preview {
		height: 3.8rem;
	}
</style>
