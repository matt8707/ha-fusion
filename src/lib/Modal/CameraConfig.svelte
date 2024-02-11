<script lang="ts">
	import {
		states,
		dashboard,
		lang,
		history,
		historyIndex,
		record,
		ripple,
		motion
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName, updateObj } from '$lib/Utils';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: any;
	export let demo: string | undefined = undefined;

	let cont: HTMLDivElement;
	let img: HTMLImageElement;

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
	$: attributes = entity?.attributes;
	$: entity_picture = attributes?.entity_picture;
	$: size = sel?.size;

	$: options = Object.keys($states)
		.filter((key) => key.startsWith('camera.'))
		.sort()
		.map((key) => ({ id: key, label: key }));

	/**
	 * 'size'
	 */

	$: if (cont && img && entity_picture && (size || !size)) {
		computeSize();
	}

	function computeSize() {
		const contRatio = cont.clientWidth / cont.clientHeight;
		const imgRatio = img.naturalWidth / img.naturalHeight;
		let width, height;

		if (imgRatio > contRatio) {
			// img is wider than container
			if (size === 'contain') {
				width = cont.clientWidth;
				height = cont.clientWidth / imgRatio;
			} else {
				// cover
				width = cont.clientHeight * imgRatio;
				height = cont.clientHeight;
			}
		} else {
			// img is taller than container
			if (size === 'contain') {
				width = cont.clientHeight * imgRatio;
				height = cont.clientHeight;
			} else {
				// cover
				width = cont.clientWidth;
				height = cont.clientWidth / imgRatio;
			}
		}
		cont.style.backgroundSize = `${width}px ${height}px`;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('camera')}</h1>

		<h2>{$lang('preview')}</h2>

		{#if entity_picture}
			<div
				class="container"
				bind:this={cont}
				style:background-image="url({entity_picture})"
				style:transition="background-size {$motion}ms ease"
			>
				<img
					bind:this={img}
					src={entity_picture}
					alt={getName(sel, entity)}
					on:load={computeSize}
				/>
			</div>
		{/if}

		{#if options}
			<h2>{$lang('entity')}</h2>

			<Select
				customItems={true}
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
	.container {
		background-repeat: no-repeat;
		background-position: center center;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 0.6rem;
		overflow: hidden;
	}

	img {
		pointer-events: none;
		visibility: hidden;
	}

	h2:first-letter {
		text-transform: uppercase;
	}
</style>
