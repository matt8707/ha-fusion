<script lang="ts">
	import { dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Time from '$lib/Sidebar/Time.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import type { TimeItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: TimeItem;

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('time')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Time seconds={sel?.seconds} hour12={sel?.hour12 || false} />
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
