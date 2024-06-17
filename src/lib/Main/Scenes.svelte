<script lang="ts">
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import Configure from '$lib/Main/Configure.svelte';
	import { ripple, editMode, states, motion, connection } from '$lib/Stores';
	import { getName } from '$lib/Utils';
	import Icon, { loadIcon } from '@iconify/svelte';
	import { onDestroy } from 'svelte';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { callService } from 'home-assistant-js-websocket';

	export let sel: any;

	let active = false;
	let timeout: ReturnType<typeof setTimeout>;

	const iconSize = '2rem';

	$: icon = sel?.icon;

	function handleClick() {
		// config
		if ($editMode) {
			return openModal(() => import('$lib/Modal/ScenesConfig.svelte'), {
				sel
			});
		}

		// generic turn_on
		callService($connection, 'homeassistant', 'turn_on', {
			entity_id: sel?.entity_id
		});

		// delay styles
		clearTimeout(timeout);
		active = true;
		timeout = setTimeout(() => {
			active = false;
		}, 1000);
	}

	onDestroy(() => clearTimeout(timeout));
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

{#if sel?.type === 'configure'}
	<Configure {sel} />
{:else}
	<div
		class:active={active && !$editMode}
		style:transition="background-color {active ? $motion / 2 : $motion}ms ease"
		class="btn"
		on:click={handleClick}
		style:cursor={$editMode ? 'unset' : 'pointer'}
		use:Ripple={{
			...$ripple,
			color: !$editMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0)'
		}}
	>
		<div class="icon">
			{#if icon}
				{#await loadIcon(icon)}
					<!-- loading -->
					<Icon icon="ph:dot" style="font-size: {iconSize}" />
				{:then resolvedIcon}
					<!-- exists -->
					<Icon icon={resolvedIcon} style="font-size: {iconSize}" />
				{:catch}
					<!-- doesn't exist -->
					<Icon icon="ooui:help-ltr" style="font-size: {iconSize}" />
				{/await}
			{:else if sel?.entity_id}
				<ComputeIcon entity_id={sel?.entity_id} skipEntitiyPicture={true} size={iconSize} />
			{:else}
				<Icon icon="ooui:help-ltr" style="font-size: {iconSize}" />
			{/if}
		</div>

		<div class="name">
			{getName(sel, $states?.[sel?.entity_id])}
		</div>
	</div>
{/if}

<style>
	.btn {
		display: grid;
		gap: 0.35rem;
		grid-template-areas:
			'icon'
			'name';
		width: 100%;
		background-color: rgba(0, 0, 0, 0.225);
		margin: 0;
		border: none;
		cursor: grab;
		padding: 0.85rem 0 0.9rem 0;
		justify-items: center;
		height: 100%;
	}

	.icon {
		grid-area: icon;
		color: var(--theme-button-background-color-on);
		width: 5rem;
		display: flex;
		justify-content: center;
	}

	.name {
		grid-area: name;
		display: block;
		margin: 0 auto;
		width: 100%;
		padding: 0 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		font-weight: 400;
		color: var(--theme-button-state-color-off);
		font-size: 0.925rem;
	}

	.active {
		background-color: rgba(0, 0, 0, 0.35);
	}
</style>
