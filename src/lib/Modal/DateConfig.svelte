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

	const dateElements = ['day', 'month', 'year'];
	$: show = sel.show ?? ['day', 'month'];

	function set(key: string, event?: any) {
		if (key === 'show') {
			let arr = show.includes(event) ? show.filter((i) => i !== event) : [...show, event];
			if (arr.length == 0) {
				return;
			} else {
				event = arr;
			}
		} else if (key === 'short') {
			let arr = sel.short ?? [];
			event = arr.includes(event) ? arr.filter((i) => i !== event) : [...arr, event];
		}
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
			<Date short={sel.short} {show} layout={sel?.layout} />
		</div>

		<!-- SHOW -->
		<h2>{$lang('show')}</h2>
		<div class="button-container">
			{#each dateElements as d}
				<button
					class:selected={show.includes(d)}
					on:click={() => set('show', d)}
					use:Ripple={$ripple}
				>
					{$lang(d)}
				</button>
			{/each}
		</div>

		{#if (show.length ?? 0) > 1}
			<!-- Layout -->
			<h2>{$lang('Layout')}</h2>
			<div class="button-container">
				<button
					class:selected={!sel?.layout || sel?.layout === 'vertical'}
					on:click={() => set('layout', 'vertical')}
					use:Ripple={$ripple}
				>
					{$lang('vertical')}
				</button>
				<button
					class:selected={sel?.layout === 'horizontal'}
					on:click={() => set('layout', 'horizontal')}
					use:Ripple={$ripple}
				>
					{$lang('horizontal')}
				</button>
			</div>
		{/if}

		<!-- SHORT -->
		{#each dateElements as d}
			{#if show.includes(d)}
				<h2>{$lang(d)}</h2>
				<div class="button-container">
					<button
						class:selected={!sel.short?.includes(d)}
						on:click={() => set('short', d)}
						use:Ripple={$ripple}
					>
						{$lang('max_length')}
					</button>
					<button
						class:selected={sel.short?.includes(d)}
						on:click={() => set('short', d)}
						use:Ripple={$ripple}
					>
						{$lang('min_length')}
					</button>
				</div>
			{/if}
		{/each}

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
		height: 3.8rem;
	}
	h2::first-letter,
	button::first-letter {
		text-transform: uppercase;
	}
</style>
