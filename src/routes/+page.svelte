<script lang="ts">
	import {
		dashboard,
		configuration,
		editMode,
		motion,
		showDrawer,
		translation,
		drawerSearch,
		focusSearch,
		currentViewId,
		selectedLanguage,
		customJs,
		authCallback,
		filterDashboard,
		disableMenuButton,
		clickOriginatedFromMenu
	} from '$lib/Stores';
	import { authentication, options } from '$lib/Socket';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { modals } from 'svelte-modals';
	import Theme from '$lib/Components/Theme.svelte';

	/**
	 * Data from server-side load
	 * function +page.server.ts
	 */
	export let data;

	$configuration = data?.configuration;
	$dashboard = data?.dashboard;
	$translation = data?.translations;
	$selectedLanguage = data?.configuration?.locale || 'en';
	$customJs = data?.configuration?.custom_js;
	$currentViewId = $dashboard?.views?.[0]?.id;

	const _motion = data?.configuration?.motion;
	$motion = _motion === undefined || _motion === true ? $motion : 0;
	$: mobileSidebarIsVisible = true;

	/**
	 * Computes the current view.
	 *
	 * filterDashboard is filtered from search input, else
	 * find `$currentViewId` OR when dragging get `isDndShadowItem`
	 */
	$: view = $drawerSearch
		? $filterDashboard
		: $dashboard?.views?.find((view) => view?.id === $currentViewId) ||
			$dashboard?.views?.find((view) => view?.isDndShadowItem);

	/**
	 * WebSocket, tries to reconnect if no previous connection has been made.
	 */

	let isConnecting = false;
	let retryInterval: ReturnType<typeof setInterval>;

	if (browser) {
		connect();
		retryInterval = setInterval(connect, 3000);
	}

	async function connect() {
		if (isConnecting) return;
		isConnecting = true;

		console.log('authenticating...');

		options.hassUrl = $configuration?.hassUrl;

		try {
			await authentication(options);
			console.log('authenticated.');
			clearInterval(retryInterval);
		} catch (err) {
			// catch but don't log
		} finally {
			isConnecting = false;
		}
	}

	onDestroy(() => clearInterval(retryInterval));

	onMount(async () => {
		/**
		 * If the "menu" parameter in the URL is set to 'false'
		 * Menu button is hidden and drawer is disabled.
		 */
		const menuParam = new URLSearchParams(window.location.search).get('menu');
		$disableMenuButton = menuParam === 'false';
	});

	/**
	 * Toggles drawer visibility and resets
	 * the `$clickOriginatedFromMenu` flag.
	 */
	function toggleDrawer() {
		$showDrawer = !$showDrawer;
		$clickOriginatedFromMenu = false;
	}

	function toggleMenu() {
		mobileSidebarIsVisible = !mobileSidebarIsVisible;
	}

	/**
	 * If in edit mode, toggle editMode by programmatically clicking `EditModeButton`
	 * to trigger any potential confirm dialogs. Else toggle drawer normally.
	 */
	function handleClick() {
		if ($editMode) {
			$clickOriginatedFromMenu = true;
			const button = document.querySelector('#drawer button') as HTMLButtonElement;
			button?.click();
		} else {
			toggleDrawer();
		}
	}

	/**
	 * Handles the keydown events for:
	 * - 'f': Shows drawer and/or focuses on the search field.
	 * - 'Escape': Hides the search focus/hides the drawer.
	 */
	function handleKeydown(event: any) {
		if ($modals.length) return;

		// don't focus on underlying element
		if (event.key === 'Escape' && !$editMode && document.activeElement) {
			(document.activeElement as HTMLElement).blur();
		}

		if (event.key === 'f' && !$disableMenuButton) {
			if (!$showDrawer || !$focusSearch) {
				$focusSearch = true;
				if (!$showDrawer) $showDrawer = true;
				event.preventDefault(); // prevent 'f'
			}
		} else if (event.key === 'Escape' && $showDrawer && !$editMode) {
			$focusSearch = false;
			if (!$drawerSearch) handleClick();
			$drawerSearch = undefined;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- theme -->
<Theme initial={data?.theme} />

<div
	id="layout"
	class={mobileSidebarIsVisible ? 'mobile-sidebar-visible' : ''}
	style="--size:{mobileSidebarIsVisible ? '100%' : '0%'};"
	style:grid-template-columns="{$dashboard?.hide_sidebar || !$dashboard?.sidebar?.length
		? '0'
		: $dashboard?.sidebarWidth || 350}px auto"
	style:grid-template-rows={$showDrawer ? 'auto auto 1fr' : '0fr auto 1fr'}
	style:transition="layout {$motion}ms ease, grid-template-columns {$motion}ms ease"
>
	<button class="absolute z-20 top-0 right-0 mr-20 h-6 w-6 mt-6 md:hidden" on:click={toggleMenu}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			role="img"
			viewBox="0 0 24 24"
			class="iconify iconify--solar rotate-180"
			><path
				fill="currentColor"
				fill-rule="evenodd"
				d="M3.172 4.172C2 5.343 2 7.229 2 11v2c0 3.771 0 5.657 1.172 6.828C4.343 21 6.229 21 10 21h5V3h-5C6.229 3 4.343 3 3.172 4.172"
				clip-rule="evenodd"
				opacity=".5"
			></path><path
				fill={mobileSidebarIsVisible ? 'black' : 'currentColor'}
				opacity={mobileSidebarIsVisible ? '.2' : '1'}
				d="M22 13v-2c0-3.771 0-5.657-1.172-6.828c-.974-.975-3.192-1.139-5.828-1.166v17.988c2.636-.027 4.854-.191 5.828-1.166C22 18.657 22 16.771 22 13"
			></path></svg
		>
	</button>
	<!-- nav -->
	{#await import('$lib/Main/Views.svelte') then Views}
		<svelte:component this={Views.default} {view} />
	{/await}

	<!-- main -->
	{#if view?.sections}
		{#await import('$lib/Main/Index.svelte') then Main}
			<svelte:component this={Main.default} {view} />
		{/await}
	{:else if $authCallback || options?.hassUrl}
		{#await import('$lib/Main/Intro.svelte') then Intro}
			<svelte:component this={Intro.default} {data} />
		{/await}
	{/if}

	<!-- aside -->
	{#await import('$lib/Sidebar/Index.svelte') then Sidebar}
		<svelte:component this={Sidebar.default} {mobileSidebarIsVisible} />
	{/await}

	<!-- menu -->
	{#if !$disableMenuButton}
		{#await import('$lib/Drawer/MenuButton.svelte') then MenuButton}
			<svelte:component this={MenuButton.default} {handleClick} />
		{/await}
	{/if}

	<!-- header -->
	{#if $showDrawer}
		{#await import('$lib/Drawer/Index.svelte') then Drawer}
			<svelte:component this={Drawer.default} {view} {data} {toggleDrawer} />
		{/await}
	{/if}

	<!-- module -->
	{#if $customJs}
		{#await import('$lib/Components/CustomJs.svelte') then CustomJs}
			<svelte:component this={CustomJs.default} />
		{/await}
	{/if}
</div>

<style>
	#layout {
		display: grid;
		grid-template-areas:
			'header header'
			'aside nav'
			'aside main';
		min-height: 100vh;
		overflow: hidden;
	}
	@media (max-width: 768px) {
		#layout {
			grid-template-columns: var(--size) auto !important;
		}
	}
</style>
