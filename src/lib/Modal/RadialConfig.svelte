<script lang="ts">
	import {
		states,
		dashboard,
		lang,
		history,
		historyIndex,
		record,
		ripple,
		entityList
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Radial from '$lib/Sidebar/Radial.svelte';
	import Select from '$lib/Components/Select.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj, getName } from '$lib/Utils';
	import Ripple from 'svelte-ripple';
	import type { RadialItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: RadialItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let name = sel?.name;
	let stroke = sel?.stroke;

	let numberElement: HTMLInputElement;

	$: entity_id = sel?.entity_id;

	const range = {
		min: 1,
		max: 15
	};

	$: options = $entityList('sensor');

	function minMax(key: string | number | undefined) {
		return Math.min(Math.max(parseInt(key as string), range.min), range.max);
	}

	function handleNumberRange(event: any) {
		const value = minMax(event?.target?.value);
		set('stroke', value);
		if (numberElement) numberElement.value = String(value);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">Radial</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Radial {entity_id} {name} strokeWidth={minMax(stroke)} />
		</div>

		<h2>{$lang('entity')}</h2>

		{#if sel && options && entity_id}
			<Select
				value={entity_id}
				placeholder={$lang('entity')}
				on:change={(event) => set('entity_id', event)}
				{options}
				computeIcons={true}
			/>
		{/if}

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
				type="text"
				class="input"
				class:placeholder={!name}
				bind:value={name}
				placeholder={getName(sel, (sel?.entity_id && $states[sel.entity_id]) || undefined)}
				on:change={(event) => set('name', event)}
				autocomplete="off"
				spellcheck="false"
				style:padding
			/>
		</InputClear>

		<h2>{$lang('size')}</h2>

		<input
			type="number"
			class="input"
			bind:value={stroke}
			bind:this={numberElement}
			placeholder="9"
			min={range.min}
			max={range.max}
			on:input={handleNumberRange}
			autocomplete="off"
		/>

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
