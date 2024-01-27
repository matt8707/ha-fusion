<script lang="ts">
	import { dashboard, states, record, lang, ripple, history, historyIndex } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Button from '$lib/Main/Button.svelte';
	import Select from '$lib/Components/Select.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { updateObj, getDomain, getName } from '$lib/Utils';
	import type { ButtonItem } from '$lib/Types';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: ButtonItem;
	export let demo: string | undefined = undefined;
	export let sectionName: string | undefined = undefined;

	$: entity = $states?.[sel?.entity_id as any] as HassEntity;
	$: entity_id = entity?.entity_id;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let name = sel?.name;

	// untested
	let color = sel?.color;
	// (maybe make reactive)

	let icon: string | undefined = sel?.icon;

	$: options = Object.keys($states)
		.sort()
		.map((key) => ({ id: key, label: key }));

	$: options_attr =
		entity?.attributes &&
		Object.keys(entity?.attributes).map((key) => ({
			id: key,
			label: key
		}));

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	async function handleClick(event: { target: HTMLButtonElement }) {
		const button: HTMLButtonElement = event.target;
		if (button) button.style.animation = '';

		if (entity_id && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(entity_id);

				if (button) {
					button.style.animation = 'copy-animation 800ms forwards';

					button.addEventListener('animationend', function callback() {
						button.style.animation = '';
						button.removeEventListener('animationend', callback);
					});
				}
			} catch (err) {
				console.error('Failed to copy to clipboard', err);
			}
		}
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('button')}</h1>

		<h2>{$lang('preview')}</h2>

		<div style:pointer-events="none">
			<Button {sel} {sectionName} />
		</div>

		<h2>{$lang('entity')}</h2>

		<div class="icon-gallery-container">
			<div style:width="calc(100% - 3.15rem - 0.8rem)">
				{#if options}
					<Select
						customItems={true}
						{options}
						placeholder={$lang('entity')}
						value={entity_id}
						keepFocus={true}
						on:change={(event) => {
							set('attribute');
							if (event?.detail === null) return;
							set('entity_id', event);
						}}
					/>
				{/if}
			</div>

			<button
				title={$lang('copy')}
				class="icon-gallery"
				on:click={handleClick}
				style:padding="0 0.8rem"
				tabindex="-1"
				use:Ripple={$ripple}
			>
				<span style:pointer-events="none" style:display="contents">
					<Icon icon="mdi:clipboard-text-multiple-outline" height="none" />
				</span>
			</button>
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
					placeholder={$lang('icon')}
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
			>
				<Icon icon="vaadin:grid-small" height="none" />
			</button>
		</div>

		<h2>{$lang('color')}</h2>

		<div class="icon-gallery-container">
			<InputClear
				condition={color}
				on:clear={() => {
					color = undefined;
					set('color');
				}}
				let:padding
			>
				<input
					name={$lang('color')}
					class="input"
					type="text"
					placeholder={$lang('color')}
					autocomplete="off"
					spellcheck="false"
					bind:value={color}
					on:change={(event) => set('color', event)}
					style:padding
				/>
			</InputClear>

			<input
				type="color"
				bind:value={color}
				on:click={() => {
					if (color === undefined) {
						color = '#ffffff';
					}
				}}
				on:change={(event) => set('color', event)}
				title={$lang('color')}
			/>
		</div>

		{#if !isNaN(parseFloat(entity?.state)) && !Number.isInteger(parseFloat(entity?.state)) && (entity?.state.match(/\./g) || []).length === 1}
			{@const precisionValues = [undefined, 0, 1, 2, 3, 4, 5]}
			<h2>{$lang('precision')}</h2>

			<div class="button-container">
				{#each precisionValues as precision}
					<button
						class:selected={sel?.precision === precision}
						on:click={() => set('precision', precision)}
						use:Ripple={$ripple}
					>
						{precision === undefined ? '∅' : precision}
					</button>
				{/each}
			</div>
		{/if}

		<h2>{$lang('attributes')}</h2>

		{#key sel?.entity_id}
			{#if options_attr}
				<InputClear
					condition={sel?.attribute}
					on:clear={() => {
						set('attribute');
					}}
					select={true}
				>
					<Select
						options={options_attr}
						placeholder={$lang('state')}
						value={sel?.attribute}
						on:change={(event) => {
							set('attribute', event);
						}}
					/>
				</InputClear>
			{/if}
		{/key}

		<h2>{$lang('show_more_info')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.more_info !== false}
				on:click={() => set('more_info')}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>

			<button
				class:selected={sel?.more_info === false}
				on:click={() => set('more_info', false)}
				use:Ripple={$ripple}
			>
				{$lang('no')}
			</button>
		</div>

		{#if getDomain(entity_id) === 'media_player'}
			<h2>Marquee</h2>

			<div class="button-container">
				<button
					class:selected={!sel?.marquee}
					on:click={() => set('marquee', false)}
					use:Ripple={$ripple}
				>
					{$lang('no')}
				</button>

				<button
					class:selected={sel?.marquee}
					on:click={() => set('marquee', true)}
					use:Ripple={$ripple}
				>
					{$lang('yes')}
				</button>
			</div>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	input[type='color'] {
		color-scheme: dark;
		height: inherit;
		width: 3.15rem;
		border: 0;
		border-radius: 0.2rem;
		padding: 0;
		cursor: pointer;
	}
</style>
