<script lang="ts">
	import {
		dashboard,
		states,
		record,
		lang,
		ripple,
		history,
		historyIndex,
		entityList
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Select from '$lib/Components/Select.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import VisibilityItemButton from '$lib/Main/VisibilityItemButton.svelte';
	import { updateObj, getName } from '$lib/Utils';
	import type { ButtonItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: ButtonItem;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: entity_id = sel?.entity_id;
	let name = sel?.name;
	let icon = sel?.icon;
	let computedIcon: string;

	$: options = $entityList('');

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('button')}</h1>

		<h2>{$lang('entity')}</h2>

		<div class="full-width">
			<Select
				{options}
				placeholder={$lang('entity')}
				value={entity_id}
				on:change={(event) => {
					if (event?.detail === null) return;
					set('entity_id', event);
				}}
				computeIcons={true}
				getIconString={true}
				on:iconString={(event) => {
					computedIcon = event?.detail;
				}}
			/>
		</div>

		<h2>{$lang('name')}</h2>

		<InputClear
			condition={name}
			on:clear={() => {
				name = undefined;
				set('name');
			}}
			let:padding
		>
			<input
				name={$lang('name')}
				class="input"
				type="text"
				placeholder={getName(sel, (entity_id && $states[entity_id]) || undefined) || $lang('name')}
				autocomplete="off"
				spellcheck="false"
				bind:value={name}
				on:change={(event) => set('name', event)}
				style:padding
			/>
		</InputClear>

		<h2>
			{$lang('icon')}
		</h2>

		<div class="icon-gallery-container">
			<InputClear
				condition={icon}
				on:clear={() => {
					icon = undefined;
					set('icon');
				}}
				let:padding
			>
				<input
					name={$lang('icon')}
					class="input"
					type="text"
					placeholder={computedIcon || $lang('icon')}
					autocomplete="off"
					spellcheck="false"
					bind:value={icon}
					on:change={(event) => set('icon', event)}
					style:padding
				/>
			</InputClear>

			<button
				use:Ripple={$ripple}
				title={$lang('icon')}
				class="icon-gallery"
				on:click={() => {
					window.open('https://icon-sets.iconify.design/', '_blank');
				}}
				style:padding="0.84rem"
			>
				<Icon icon="majesticons:open-line" height="none" />
			</button>
		</div>

		<h2>{$lang('visibility')}</h2>

		<div style="display: flex; gap: 0.8rem;">
			<VisibilityItemButton item={sel} />
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	.full-width {
		width: -webkit-fill-available;
		width: -moz-available;
	}
</style>
