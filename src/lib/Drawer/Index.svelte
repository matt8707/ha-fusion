<script lang="ts">
	import { editMode, history, historyIndex, motion } from '$lib/Stores';
	import Separator from '$lib/Drawer/Separator.svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import '$lib/Drawer/Drawer.css';
	import type { Configuration, Dashboard, Translations, ViewItem } from '$lib/Types';
	import { loadIcons } from '@iconify/svelte';

	export let data: {
		configuration: Configuration;
		dashboard: Dashboard;
		theme: any;
		translations: Translations;
	};
	export let view: ViewItem | undefined;
	export let toggleDrawer: () => void;

	/** Only display SayButton in Chrome */
	// let chrome: boolean;
	onMount(() => {
		// chrome = navigator?.userAgent?.indexOf('Chrome') > -1;

		// preload drawer $editMode icons
		loadIcons([
			'gridicons:add-outline',
			'material-symbols:invert-colors-rounded',
			'ion:arrow-undo-sharp',
			'ion:arrow-redo-sharp',
			'ic:round-save',
			'solar:sidebar-minimalistic-bold-duotone',
			'solar:file-bold-duotone',
			'gg:row-first',
			'solar:posts-carousel-horizontal-bold-duotone',
			'fluent:tab-add-24-filled'
		]);
	});

	/**
	 * Determines whether the dashboard data has been modified,
	 * property is passed to both `EditModeButton` and `SaveButton`
	 */
	$: modified = $history?.[$historyIndex] !== $history?.[0];
</script>

<header id="drawer" transition:slide|global={{ duration: $motion }}>
	<div class:grid={!$editMode} class:grid-editmode={$editMode}>
		<div class="edit">
			{#await import('$lib/Drawer/EditModeButton.svelte') then EditModeButton}
				<svelte:component this={EditModeButton.default} {modified} {toggleDrawer} />
			{/await}
		</div>

		{#if $editMode}
			<div class="add">
				{#await import('$lib/Drawer/AddDropdown.svelte') then AddDropdown}
					<svelte:component this={AddDropdown.default} {view} />
				{/await}
			</div>

			<div class="appearance">
				{#await import('$lib/Drawer/AppearanceButton.svelte') then AppearanceButton}
					<svelte:component this={AppearanceButton.default} />
				{/await}
			</div>

			<div class="history">
				{#await import('$lib/Drawer/HistoryButtons.svelte') then HistoryButtons}
					<svelte:component this={HistoryButtons.default} />
				{/await}
			</div>

			<div class="save push">
				{#await import('$lib/Drawer/SaveButton.svelte') then SaveButton}
					<svelte:component this={SaveButton.default} {modified} />
				{/await}
			</div>
		{:else}
			<div class="code">
				{#await import('$lib/Drawer/CodeButton.svelte') then CodeButton}
					<svelte:component this={CodeButton.default} />
				{/await}
			</div>

			<Separator />

			<div class="search">
				{#await import('$lib/Drawer/SearchInput.svelte') then SearchInput}
					<svelte:component this={SearchInput.default} />
				{/await}
			</div>

			<div class="settings push">
				{#await import('$lib/Drawer/SettingsButton.svelte') then SettingsButton}
					<svelte:component this={SettingsButton.default} {data} />
				{/await}
			</div>

			<!-- {#if chrome}
				{#await import('$lib/Drawer/SayButton.svelte') then SayButton}
					<svelte:component this={SayButton.default} />
				{/await}
			{/if} -->
		{/if}
	</div>
</header>

<style>
	#drawer {
		height: 4.75rem;
		width: 100vw;
		padding: 1rem 2rem;
		background-color: var(--theme-colors-sidebar-background);
		border-bottom: var(--theme-colors-sidebar-border);
	}

	.edit {
		grid-area: edit;
	}

	.add {
		grid-area: add;
	}

	.appearance {
		grid-area: appearance;
	}

	.history {
		grid-area: history;
		justify-self: end;
	}

	.save {
		grid-area: save;
	}

	.code {
		grid-area: code;
	}

	.search {
		grid-area: search;
		display: grid;
		max-width: 20rem;
	}

	.settings {
		grid-area: settings;
	}

	.push {
		justify-self: end;
		margin-right: 3.7rem;
	}

	.grid {
		display: grid;
		gap: 0.5rem;
		grid-template-areas: 'edit code div search settings';
		grid-template-columns: auto auto auto 1fr auto;
		width: 100%;
	}

	.grid-editmode {
		display: grid;
		gap: 0.5rem;
		grid-template-areas: 'edit add appearance . history save';
		grid-template-columns: auto auto auto 1fr auto auto;
		width: 100%;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		#drawer {
			padding: 1rem 1.25rem;
			height: 8rem;
			flex-wrap: wrap;
		}

		.grid {
			grid-template-columns: auto auto 1fr 1fr;
			grid-template-areas:
				'edit code . settings'
				'search search search search';
		}

		.grid-editmode {
			grid-template-columns: auto auto 1fr auto;
			grid-template-areas:
				'edit add  appearance .'
				'history history history save';
		}

		.save {
			margin-right: 0;
		}
	}
</style>
