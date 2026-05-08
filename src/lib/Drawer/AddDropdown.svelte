<script lang="ts">
	import { dashboard } from '$lib/Stores';
	import type { ViewItem } from '$lib/Types';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';

	export let view: ViewItem | undefined;

	let SidebarButton: ComponentType;
	let ObjectButton: ComponentType;
	let SectionButton: ComponentType;
	let HorizontalStackButton: ComponentType;
	let VerticalStackButton: ComponentType;
	let ScenesButton: ComponentType;
	let ViewButton: ComponentType;

	onMount(async () => {
		[
			SidebarButton,
			ObjectButton,
			SectionButton,
			HorizontalStackButton,
			VerticalStackButton,
			ScenesButton,
			ViewButton
		] = await Promise.all([
			import('$lib/Drawer/SidebarButton.svelte').then((m) => m.default),
			import('$lib/Drawer/ObjectButton.svelte').then((m) => m.default),
			import('$lib/Drawer/SectionButton.svelte').then((m) => m.default),
			import('$lib/Drawer/HorizontalStackButton.svelte').then((m) => m.default),
			import('$lib/Drawer/VerticalStackButton.svelte').then((m) => m.default),
			import('$lib/Drawer/ScenesButton.svelte').then((m) => m.default),
			import('$lib/Drawer/ViewButton.svelte').then((m) => m.default)
		]);
	});
</script>

<div class="add-buttons">
	{#if ObjectButton}
		<svelte:component this={ObjectButton} {view} />
	{/if}

	{#if SectionButton}
		<svelte:component this={SectionButton} {view} />
	{/if}

	{#if HorizontalStackButton}
		<svelte:component this={HorizontalStackButton} {view} />
	{/if}

	{#if VerticalStackButton}
		<svelte:component this={VerticalStackButton} {view} />
	{/if}

	{#if ScenesButton}
		<svelte:component this={ScenesButton} {view} />
	{/if}

	{#if !$dashboard.hide_sidebar && SidebarButton}
		<svelte:component this={SidebarButton} />
	{/if}

	{#if ViewButton}
		<svelte:component this={ViewButton} />
	{/if}
</div>

<style>
	.add-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}
</style>
