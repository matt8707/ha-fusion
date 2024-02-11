<script lang="ts">
	import { dashboard, lang, record, ripple } from '$lib/Stores';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Navigate from '$lib/Sidebar/Navigate.svelte';
	import Ripple from 'svelte-ripple';
	import type { NavigateItem } from '$lib/Types';
	import { updateObj } from '$lib/Utils';
	import { onDestroy } from 'svelte';

	export let isOpen: boolean;
	export let sel: NavigateItem;

	let modalTransitionEnd = false;
	function handleEvent() {
		modalTransitionEnd = true;
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal on:transitionend={handleEvent}>
		<h1 slot="title">{$lang('navigate')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Navigate {modalTransitionEnd} />
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
