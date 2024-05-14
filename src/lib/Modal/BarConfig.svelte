<script lang="ts">
	import {
		states,
		dashboard,
		barErrors,
		motion,
		lang,
		history,
		historyIndex,
		ripple,
		record,
		entityList
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import { slide } from 'svelte/transition';
	import Bar from '$lib/Sidebar/Bar.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Select from '$lib/Components/Select.svelte';
	import Ripple from 'svelte-ripple';
	import InputClear from '$lib/Components/InputClear.svelte';
	import { updateObj, getName } from '$lib/Utils';
	import type { BarItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: BarItem;

	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let name = sel?.name;

	$: entity_id = sel?.entity_id;

	$: math = sel?.math || '';

	$: options = $entityList('sensor');

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">Bar</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Bar id={sel?.id} {entity_id} {name} {math} />
		</div>

		<h2>{$lang('entity')}</h2>

		{#if options}
			<Select
				{options}
				placeholder={$lang('entity')}
				value={entity_id}
				on:change={(event) => set('entity_id', event)}
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
				id="bar_name"
				type="text"
				bind:value={name}
				on:change={(event) => set('name', event)}
				placeholder={getName(sel, (entity_id && $states[entity_id]) || undefined)}
				class:input={true}
				class:placeholder={!name}
				autocomplete="off"
				spellcheck="false"
				style:padding
			/>
		</InputClear>

		<h2>{$lang('value')}</h2>

		<div style:height="3rem">
			{#if sel?.id && $barErrors?.[sel?.id] && math !== ''}
				<p class="error-message" transition:slide={{ duration: $motion / 1.5 }}>
					{$barErrors[sel.id.toString()]}
				</p>
			{:else}
				{@const formulas = ['x', '100 - x', 'Math.round(x)', 'x * 100']}

				<div class="pre-container" transition:slide={{ duration: $motion / 1.5 }}>
					{#each formulas as formula}
						<button class="math" on:click={() => set('math', formula)} use:Ripple={$ripple}>
							<pre>{formula}</pre>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<InputClear
			condition={math}
			on:clear={() => {
				math = '';
				set('math');
			}}
			let:padding
		>
			<input
				id="bar_math"
				class="input"
				type="text"
				on:input={(event) => set('math', event)}
				bind:value={math}
				placeholder="x"
				autocomplete="off"
				spellcheck="false"
				style="font-family: monospace; font-size: 1rem;"
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
	.error-message {
		color: white;
		margin-bottom: 12px;
		background-color: rgb(178 0 0 / 74%);
		padding: 0.6rem 0.7rem 0.45rem 0.7rem;
		border-radius: 0.6rem;
		font-family: monospace;
		font-size: 0.85rem;
		border: 1px solid rgb(255 255 255 / 15%);
	}

	.pre-container {
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
	}

	.math {
		padding: 0.6rem 0.7rem 0.45rem 0.7rem;
		color: inherit;
		border: none;
		background-color: rgb(73 134 162 / 21%);
		border: 1px solid rgb(255 255 255 / 15%);
		cursor: pointer;
		font-size: 0.85rem;
		border-radius: 0.6rem;
	}

	.math pre {
		margin: 0;
	}

	p {
		margin-block-start: 0;
		margin-block-end: 0;
	}
</style>
