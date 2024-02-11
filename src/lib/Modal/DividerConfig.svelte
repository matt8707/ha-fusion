<script lang="ts">
	import { lang, ripple, dashboard, motion, record } from '$lib/Stores';
	import Divider from '$lib/Sidebar/Divider.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import type { SidebarItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';
	import { updateObj } from '$lib/Utils';
	import InputClear from '$lib/Components/InputClear.svelte';
	import { onDestroy } from 'svelte';

	export let isOpen: boolean;
	export let sel: SidebarItem;

	let size = sel?.size;

	const defaultValue = '50';

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	function handleChange(event: any) {
		const target = event?.target;
		if (!target?.value) return;
		set('size', Number(event?.target?.value));
	}

	onDestroy(() => {
		if (sel?.mode !== 'empty') {
			// clear all
			set('mode');
			set('size');
			size = undefined;
		}
		$record();
	});
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('divider')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview" style:transition="height {$motion}ms ease">
			<Divider mode={sel?.mode} size={sel?.size} {defaultValue} />
		</div>

		<div class="button-container">
			<button class:selected={!sel?.mode} on:click={() => set('mode')} use:Ripple={$ripple}>
				{$lang('divider')}
			</button>

			<button
				class:selected={sel?.mode === 'empty'}
				on:click={() => set('mode', 'empty')}
				use:Ripple={$ripple}
			>
				{$lang('empty')}
			</button>
		</div>

		{#if sel?.mode === 'empty'}
			<h2>{$lang('size')}</h2>

			<InputClear
				condition={size}
				on:clear={() => {
					set('size');
					size = undefined;
				}}
				let:padding
			>
				<input
					min="20"
					max="999"
					type="number"
					class="input"
					bind:value={size}
					placeholder={defaultValue}
					on:change={handleChange}
					autocomplete="off"
					spellcheck="false"
					style:padding
				/>
			</InputClear>
		{/if}

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
		margin-bottom: 1rem;
	}

	input[type='number'] {
		color-scheme: dark;
	}
</style>
