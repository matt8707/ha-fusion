<script lang="ts">
	import { dashboard, lang, history, historyIndex, record, ripple, entityList } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Timer from '$lib/Sidebar/Timer.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { TimerItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: TimerItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: options = $entityList('timer');

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('timer')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Timer {sel} />
		</div>

		<h2>{$lang('entity')}</h2>

		<div>
			{#if sel && options}
				<Select
					value={sel?.entity_id}
					placeholder={$lang('entity')}
					on:change={(event) => set('entity_id', event)}
					{options}
					computeIcons={true}
				/>
			{/if}
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
