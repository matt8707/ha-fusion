<script lang="ts">
	import { dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import TimeDate from '$lib/Sidebar/DateTime.svelte';	
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { TimeDateItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: TimeDateItem;

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('date_time')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<TimeDate seconds={sel?.seconds} hour12={sel?.hour12} short_day={sel?.short_day} short_month={sel?.short_month} year={sel?.year} hide={sel?.hide}/>
		</div>

		<h2>{$lang('time_format_header')}</h2>

		<div class="button-container">
			<button
				class:selected={!sel?.hour12}
				on:click={() => set('hour12', false)}
				use:Ripple={$ripple}
			>
				{$lang('time_format_24')}
			</button>

			<button
				class:selected={sel?.hour12}
				on:click={() => set('hour12', true)}
				use:Ripple={$ripple}
			>
				{$lang('time_format_12')}
			</button>
		</div>

		<h2>{$lang('seconds')}</h2>

		<div class="button-container">
			<button
				class:selected={!sel?.seconds}
				on:click={() => set('seconds', false)}
				use:Ripple={$ripple}
			>
				{$lang('no')}
			</button>

			<button
				class:selected={sel?.seconds}
				on:click={() => set('seconds', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>
		</div>

		<!-- DAY -->
		<h2>{$lang('day')}</h2>
		<div class="button-container">
			<button
				class:selected={!sel?.short_day}
				on:click={() => set('short_day', false)}
				use:Ripple={$ripple}
			>
				{$lang('max')}
			</button>
			<button
				class:selected={sel?.short_day}
				on:click={() => set('short_day', true)}
				use:Ripple={$ripple}
			>
				{$lang('min')}
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
				{$lang('max')}
			</button>
			<button
				class:selected={sel?.short_month}
				on:click={() => set('short_month', true)}
				use:Ripple={$ripple}
			>
				{$lang('min')}
			</button>
		</div>	

		<!-- YEAR -->
		<h2>{$lang('year')}</h2>
		<div class="button-container">
			<button
				class:selected={!sel?.year}
				on:click={() => set('year', false)}
				use:Ripple={$ripple}
			>
				{$lang('no')}
			</button>

			<button
				class:selected={sel?.year}
				on:click={() => set('year', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
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
