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

	export let isOpen: boolean;
	export let sel: ButtonItem;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	let name = sel?.name;

	// untested
	let color = sel?.color;
	// (maybe make reactive)

	$: entity_id = sel?.entity_id;

	let icon: string | undefined = sel?.icon;

	$: options = Object.keys($states)
		.sort()
		.map((key) => ({ id: key, label: key }));

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
			<Button {sel} />
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
						on:change={(event) => set('entity_id', event)}
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
