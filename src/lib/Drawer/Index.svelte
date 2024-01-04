<script lang="ts">
	import { dashboard, editMode, history, historyIndex, motion } from '$lib/Stores';
	import Separator from '$lib/Drawer/Separator.svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import '$lib/Drawer/Drawer.css';
	import type { Configuration, Dashboard, Translations, ViewItem } from '$lib/Types';

	export let data: {
		configuration: Configuration;
		dashboard: Dashboard;
		theme: any;
		translations: Translations;
	};
	export let view: ViewItem | undefined;
	export let toggleDrawer: () => void;

	/** Only display SayButton in Chrome */
	let chrome: boolean;
	onMount(() => {
		chrome = navigator?.userAgent?.indexOf('Chrome') > -1;
	});

	/**
	 * Determines whether the dashboard data has been modified,
	 * property is passed to both `EditModeButton` and `SaveButton`
	 */
	$: modified = $history?.[$historyIndex] !== $history?.[0];
</script>

<header id="drawer" transition:slide|global={{ duration: $motion }}>
	{#await import('$lib/Drawer/EditModeButton.svelte') then EditModeButton}
		<svelte:component this={EditModeButton.default} {modified} {toggleDrawer} />
	{/await}

	{#if $editMode}
		<Separator />

		{#if !$dashboard.hide_sidebar}
			{#await import('$lib/Drawer/SidebarButton.svelte') then SidebarButton}
				<svelte:component this={SidebarButton.default} />
			{/await}
		{/if}

		{#await import('$lib/Drawer/ObjectButton.svelte') then ObjectButton}
			<svelte:component this={ObjectButton.default} {view} />
		{/await}

		<Separator />

		{#await import('$lib/Drawer/SectionButton.svelte') then SectionButton}
			<svelte:component this={SectionButton.default} {view} />
		{/await}

		{#await import('$lib/Drawer/HorizontalStackButton.svelte') then HorizontalStackButton}
			<svelte:component this={HorizontalStackButton.default} {view} />
		{/await}

		{#await import('$lib/Drawer/ViewButton.svelte') then ViewButton}
			<svelte:component this={ViewButton.default} />
		{/await}

		<Separator />

		{#await import('$lib/Drawer/AppearanceButton.svelte') then AppearanceButton}
			<svelte:component this={AppearanceButton.default} />
		{/await}

		<div class="actions">
			{#await import('$lib/Drawer/HistoryButtons.svelte') then HistoryButtons}
				<svelte:component this={HistoryButtons.default} />
			{/await}

			<Separator />

			{#await import('$lib/Drawer/SaveButton.svelte') then SaveButton}
				<svelte:component this={SaveButton.default} {modified} />
			{/await}
		</div>
	{:else}
		{#await import('$lib/Drawer/CodeButton.svelte') then CodeButton}
			<svelte:component this={CodeButton.default} />
		{/await}

		<Separator />

		{#await import('$lib/Drawer/SearchInput.svelte') then SearchInput}
			<svelte:component this={SearchInput.default} />
		{/await}

		{#if chrome}
			<Separator />

			{#await import('$lib/Drawer/SayButton.svelte') then SayButton}
				<svelte:component this={SayButton.default} />
			{/await}
		{/if}

		<div>
			{#await import('$lib/Drawer/SettingsButton.svelte') then SettingsButton}
				<svelte:component this={SettingsButton.default} {data} />
			{/await}
		</div>
	{/if}
</header>

<style>
	#drawer {
		grid-area: header;
		min-height: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		height: auto;
		width: 100vw;
		padding: 1rem 2rem;
		background-color: var(--theme-colors-sidebar-background);
		border-bottom: var(--theme-colors-sidebar-border);
	}

	.actions {
		display: flex;
		margin-left: auto;
		margin-right: 3.6rem;
		gap: 0.5rem;
		overflow: hidden;
	}
</style>
