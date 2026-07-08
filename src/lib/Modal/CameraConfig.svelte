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
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import VisibilityItemButton from '$lib/Main/VisibilityItemButton.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import Ripple from 'svelte-ripple';
	import Camera from '$lib/Main/Camera.svelte';

	export let isOpen: boolean;
	export let sel: any;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	$: entity = $states?.[sel?.entity_id];

	$: options = $entityList('camera');

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('camera')}</h1>

		<h2>{$lang('preview')}</h2>

		<Camera {sel} responsive={true} muted={true} controls={false} />

		{#if options}
			<h2>{$lang('entity')}</h2>

			<Select
				computeIcons={true}
				{options}
				placeholder={$lang('camera')}
				value={entity?.entity_id}
				on:change={(event) => {
					set('entity_id', event);
				}}
			/>
		{/if}

		<h2>{$lang('live')}</h2>

		<div class="button-container">
			<button class:selected={!sel?.stream} on:click={() => set('stream')} use:Ripple={$ripple}>
				{$lang('no')}
			</button>

			<button
				class:selected={sel?.stream === true}
				on:click={() => set('stream', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>
		</div>

		<h2>{$lang('size')}</h2>

		<div class="button-container">
			<button class:selected={!sel?.size} on:click={() => set('size')} use:Ripple={$ripple}>
				{$lang('fill')}
			</button>

			<button
				class:selected={sel?.size === 'contain'}
				on:click={() => set('size', 'contain')}
				use:Ripple={$ripple}
			>
				{$lang('aspect_ratio')}
			</button>
		</div>

		<!-- only show if it's a sidebar item -->
		{#if $dashboard?.sidebar?.find((item) => item?.id === sel?.id)}
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
		{:else}
			<!-- only show visibility for main items, not sidebar items -->
			<h2>{$lang('visibility')}</h2>

			<div style="display: flex; gap: 0.8rem;">
				<VisibilityItemButton item={sel} />
			</div>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	h2:first-letter {
		text-transform: uppercase;
	}
</style>
