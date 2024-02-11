<script lang="ts">
	import { dashboard, lang, record, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Iframe from '$lib/Sidebar/Iframe.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { IframeItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: IframeItem;

	let url = sel?.url;
	let size = sel?.size;

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('iframe')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Iframe {url} {size} preview={true} />
		</div>

		<h2>{$lang('url')}</h2>

		<InputClear
			condition={url}
			on:clear={() => {
				url = undefined;
				set('url');
			}}
			let:padding
		>
			<input
				type="text"
				class="input"
				bind:value={url}
				placeholder="https://"
				on:change={(event) => set('url', event)}
				autocomplete="off"
				spellcheck="false"
				style:padding
			/>
		</InputClear>

		<h2>{$lang('size')}</h2>

		<InputClear
			condition={size}
			on:clear={() => {
				size = undefined;
				set('size');
			}}
			let:padding
		>
			<input
				type="text"
				class="input"
				bind:value={size}
				placeholder="150px"
				on:change={(event) => set('size', event)}
				autocomplete="off"
				spellcheck="false"
				style:padding
			/>
		</InputClear>

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
