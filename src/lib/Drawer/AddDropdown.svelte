<script lang="ts">
	import { dashboard, lang, motion, ripple } from '$lib/Stores';
	import { cubicOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import type { ViewItem } from '$lib/Types';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';

	export let view: ViewItem | undefined;

	let isOpen = false;
	let showTriangle = false;
	let container: HTMLDivElement;

	let SidebarButton: ComponentType;
	let ObjectButton: ComponentType;
	let SectionButton: ComponentType;
	let HorizontalStackButton: ComponentType;
	let ScenesButton: ComponentType;
	let ViewButton: ComponentType;

	onMount(async () => {
		SidebarButton = (await import('$lib/Drawer/SidebarButton.svelte')).default;
		ObjectButton = (await import('$lib/Drawer/ObjectButton.svelte')).default;
		SectionButton = (await import('$lib/Drawer/SectionButton.svelte')).default;
		HorizontalStackButton = (await import('$lib/Drawer/HorizontalStackButton.svelte')).default;
		ScenesButton = (await import('$lib/Drawer/ScenesButton.svelte')).default;
		ViewButton = (await import('$lib/Drawer/ViewButton.svelte')).default;
	});

	function handleClick() {
		isOpen = !isOpen;
	}

	/**
	 * Close dropdown when clicking outside if it
	 */
	function handlePointerDown(event: PointerEvent) {
		if (isOpen && container && !container.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	/**
	 * Close dropdown on ESC key press
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			event.stopPropagation();
			isOpen = false;
		}
	}
</script>

<svelte:window on:pointerdown|capture={handlePointerDown} on:keydown|capture={handleKeydown} />

<div class="container" bind:this={container}>
	<button class="button" on:click={handleClick} use:Ripple={$ripple}>
		<figure>
			<Icon icon="gridicons:add-outline" height="none" />
		</figure>

		<span>{$lang('add')}</span>
	</button>

	{#if isOpen}
		<div
			class="dropdown"
			on:introstart={() => {
				showTriangle = true;
			}}
			on:outrostart={() => {
				showTriangle = false;
			}}
			in:slide={{ duration: $motion, easing: cubicOut }}
			out:fade={{ duration: $motion / 3, easing: cubicOut }}
		>
			{#if !$dashboard.hide_sidebar}
				<svelte:component this={SidebarButton} on:clicked={handleClick} />
			{/if}

			<svelte:component this={ObjectButton} {view} on:clicked={handleClick} />

			<svelte:component this={SectionButton} {view} on:clicked={handleClick} />

			<svelte:component this={HorizontalStackButton} {view} on:clicked={handleClick} />

			<svelte:component this={ScenesButton} {view} on:clicked={handleClick} />

			<svelte:component this={ViewButton} on:clicked={handleClick} />
		</div>
	{/if}

	{#if showTriangle}
		<div
			class="triangle"
			in:fade={{ duration: $motion / 3, easing: cubicOut }}
			out:fade={{ duration: $motion / 3, easing: cubicOut }}
		></div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		display: grid;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		background: #1d1b18;
		z-index: 1;
		border-radius: 0.4rem;
		overflow: hidden;
		padding: 0 0.4rem;
	}

	.triangle {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-bottom: 8px solid #1d1b18;
	}
</style>
