<script lang="ts">
	import {
		dashboard,
		states,
		record,
		lang,
		ripple,
		history,
		historyIndex,
		templates,
		entityList
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Button from '$lib/Main/Button.svelte';
	import Select from '$lib/Components/Select.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import InputClear from '$lib/Components/InputClear.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import VisibilityItemButton from '$lib/Main/VisibilityItemButton.svelte';
	import { updateObj, getDomain, getName, getTogglableService } from '$lib/Utils';
	import type { ButtonItem } from '$lib/Types';
	import { openModal } from 'svelte-modals';
	import parser from 'js-yaml';

	export let isOpen: boolean;
	export let sel: ButtonItem;
	export let demo: string | undefined = undefined;
	export let sectionName: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	$: entity_id = sel?.entity_id;
	let name = sel?.name;
	let color = sel?.color;
	let icon = sel?.icon;
	let state = sel?.state;
	let computedIcon: string;

	$: options = $entityList('');

	$: template = $templates?.[sel?.id];

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());

	let servicePlaceholder: string;

	$: if (entity_id || template?.service?.output) updateServicePlaceholder();

	function updateServicePlaceholder() {
		try {
			// parse the `template.service`
			if (template?.service?.output) {
				const parsed = parser.load(template.service.output) as {
					service: string;
					data: Record<string, any>;
				};
				servicePlaceholder = parsed?.service || $lang('none');
			} else {
				// toggleService
				const service = getTogglableService($states[sel?.entity_id]);
				servicePlaceholder = service || $lang('none');
			}
		} catch {
			// error
			servicePlaceholder = $lang('error');
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('button')}</h1>

		<h2>{$lang('preview')}</h2>

		<div style:pointer-events="none">
			<Button {sel} {sectionName} />
		</div>

		<h2>{$lang('entity')}</h2>

		<div style="display: flex; gap: 0.8rem;">
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

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={() => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'set_state'
					});
				}}
				style:padding="0.85rem"
				class:template-active={template?.set_state?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" />
			</button>
		</div>

		<h2>{$lang('name')}</h2>

		<div class="icon-gallery-container">
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
					placeholder={template?.name?.output ||
						getName(sel, (entity_id && $states[entity_id]) || undefined) ||
						$lang('name')}
					autocomplete="off"
					spellcheck="false"
					bind:value={name}
					on:change={(event) => set('name', event)}
					style:padding
					disabled={Boolean(template?.name?.output)}
					class:disabled={Boolean(template?.name?.output)}
				/>
			</InputClear>

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={async () => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'name'
					});
				}}
				style:padding="0.85rem"
				class:template-active={template?.name?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" /></button
			>
		</div>

		<h2>{$lang('state')}</h2>

		<div class="icon-gallery-container">
			<InputClear
				condition={state}
				on:clear={() => {
					state = undefined;
					set('state');
				}}
				let:padding
			>
				<input
					name={$lang('state')}
					class="input"
					type="text"
					placeholder={template?.state?.output ||
						(entity_id && $states?.[entity_id]?.state) ||
						$lang('state')}
					autocomplete="off"
					spellcheck="false"
					bind:value={state}
					on:change={(event) => set('state', event)}
					style:padding
					disabled={Boolean(template?.state?.output)}
					class:disabled={Boolean(template?.state?.output)}
				/>
			</InputClear>

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={async () => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'state'
					});
				}}
				style:padding="0.85rem"
				class:template-active={template?.state?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" /></button
			>
		</div>

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
					placeholder={(sel?.template?.icon && template?.icon?.output) ||
						computedIcon ||
						$lang('icon')}
					autocomplete="off"
					spellcheck="false"
					bind:value={icon}
					on:change={(event) => set('icon', event)}
					style:padding
					disabled={Boolean(sel?.template?.icon && template?.icon?.output)}
					class:disabled={Boolean(sel?.template?.icon && template?.icon?.output)}
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

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={() => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'icon'
					});
				}}
				style:padding="0.85rem"
				class:template-active={sel?.template?.icon && template?.icon?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" /></button
			>
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
					placeholder={sel?.template?.color && template?.color?.output
						? template?.color?.output
						: $states?.[sel?.entity_id]?.attributes?.hs_color
							? `hsl(${$states?.[sel?.entity_id]?.attributes?.hs_color}%, 50%)`
							: 'rgb(75, 166, 237)'}
					autocomplete="off"
					spellcheck="false"
					bind:value={color}
					on:change={(event) => set('color', event)}
					style:padding
					disabled={Boolean(template?.color?.output)}
					class:disabled={Boolean(template?.color?.output)}
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

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={() => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'color'
					});
				}}
				style:padding="0.85rem"
				class:template-active={template?.color?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" /></button
			>
		</div>

		<h2>{$lang('service')}</h2>

		<div class="icon-gallery-container">
			<input
				name={$lang('service')}
				class="input"
				type="text"
				placeholder={servicePlaceholder}
				autocomplete="off"
				spellcheck="false"
				disabled={true}
				class:disabled={true}
			/>

			<button
				use:Ripple={$ripple}
				title={$lang('template')}
				class="icon-gallery"
				on:click={() => {
					if (!sel?.id) return;
					openModal(() => import('$lib/Modal/Templater.svelte'), {
						sel,
						type: 'service'
					});
				}}
				style:padding="0.85rem"
				class:template-active={template?.service?.output}
			>
				<Icon icon="ph:brackets-curly-bold" height="none" /></button
			>
		</div>

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

		<h2>{$lang('visibility')}</h2>

		<div style="display: flex; gap: 0.8rem;">
			<VisibilityItemButton item={sel} />
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
		padding: 0;
		-webkit-appearance: none;
		appearance: none;
		background-color: transparent;
		cursor: pointer;
		border: none;
	}

	input[type='color']::-webkit-color-swatch {
		border-radius: 0.6rem;
		border: none;
	}

	input[type='color']::-moz-color-swatch {
		border-radius: 0.6rem;
		border: none;
	}

	.template-active {
		color: rgb(59, 15, 16) !important;
		background-color: rgb(255, 193, 7) !important;
	}

	.disabled {
		opacity: 0.4;
	}

	.full-width {
		width: -webkit-fill-available;
		width: -moz-available;
	}
</style>
