<script lang="ts">
	import { dashboard, lang, history, historyIndex, record, ripple, entityList } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Image from '$lib/Sidebar/Image.svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import { updateObj } from '$lib/Utils';
	import type { ImageItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: ImageItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('url', demo);
	}

	let url = sel?.url;

	$: options = $entityList('image');

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('picture')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Image entity_id={sel?.entity_id} {url} />
		</div>

		<h2>{$lang('entity')}</h2>

		<div class:disabled={url}>
			{#if sel && options}
				<Select
					value={sel?.entity_id}
					placeholder={$lang('entity')}
					defaultIcon="mdi:image"
					on:change={(event) => set('entity_id', event)}
					{options}
					computeIcons={true}
				/>
			{/if}
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
		max-width: 25rem;
	}

	.disabled {
		opacity: 0.3;
		pointer-events: none;
	}
</style>
