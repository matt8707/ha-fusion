<script lang="ts">
	import {
		dashboard,
		record,
		currentViewId,
		motion,
		editMode,
		viewUnderline,
		highlightView,
		draggingView
	} from '$lib/Stores';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { slide, fade } from 'svelte/transition';
	import { modals } from 'svelte-modals';
	import { onMount, tick } from 'svelte';
	import EditViewButton from '$lib/Main/EditViewButton.svelte';
	import EyeIndicator from '$lib/Main/EyeIndicator.svelte';

	export let view: any;

	let buttons: { [key: number]: HTMLButtonElement } = {};
	let width: number;
	let left: number;

	/**
	 * Compute width and left values on active view-button
	 */
	$: if ($currentViewId && !$modals.length) {
		const activeButton = buttons[$currentViewId];
		if (activeButton) {
			width = activeButton.clientWidth - 1;
			left = activeButton.offsetLeft;
		}
	}

	const borderStyle = '3px solid white';

	/**
	 * Handle drag event
	 */
	async function handleDragEvent(event: CustomEvent<DndEvent>) {
		$dashboard.views = event.detail.items as any;

		if (event.type === 'consider') {
			$draggingView = true;
		}

		if (event?.type === 'finalize') {
			$record();
			await tick();
			$highlightView = true;
			$draggingView = false;
		}
	}

	/**
	 * Applies border to the dragged element based on the current page ID.
	 */
	function addBorder(element: HTMLElement | undefined, data: any) {
		if (element && $currentViewId === data.id) {
			element.style.borderBottom = borderStyle;
		} else {
			$highlightView = true;
		}
	}

	onMount(() => {
		/**
		 * Set `$currentViewId` based on 'view' url param
		 */
		const viewParam = new URLSearchParams(window.location.search).get('view');
		const paramView = $dashboard?.views?.find((view) => view.name === viewParam);
		if (paramView?.id) {
			$currentViewId = paramView?.id;
		}
	});

	// navbar = 100% - (sidebar & padding & eye & button & padding + safety margin)
	let editViewButtonWidth: number;
	let eyeWidth: number;
	$: navWidth = `calc(100vw - (${$dashboard?.sidebarWidth}px + 2rem + ${eyeWidth || 0}px + ${editViewButtonWidth}px + 2rem + 0.1rem))`;
</script>

<nav>
	<!-- only show if there are views and (editMode || !hide_views) -->
	{#if $dashboard.views.length === 0 ? false : $editMode ? true : !$dashboard?.hide_views}
		<section transition:slide={{ duration: $motion }}>
			{#if $editMode}
				<EditViewButton
					{view}
					on:change={(event) => {
						editViewButtonWidth = event?.detail;
					}}
				/>
			{/if}

			{#if $dashboard?.hide_views}
				<EyeIndicator bind:eyeWidth />
			{/if}

			<div class="navigation-container" style:width={navWidth}>
				<div class="fadecont" transition:fade={{ duration: $motion / 2 }}>
					<div class="top-bar">
						<div
							id="navigation"
							use:dndzone={{
								type: 'navigate',
								transformDraggedElement: addBorder,
								items: $dashboard.views,
								flipDurationMs: $motion,
								dragDisabled: !$editMode,
								dropTargetStyle: {},
								morphDisabled: true,
								zoneTabIndex: -1
							}}
							on:consider={handleDragEvent}
							on:finalize={handleDragEvent}
						>
							{#each $dashboard.views as view (view.id)}
								<button
									id={String(view.id)}
									class="nav-button"
									bind:this={buttons[view.id || 0]}
									on:click={() => {
										if ($currentViewId !== view.id) {
											$currentViewId = view.id;
											$viewUnderline = false;
											$highlightView = false;
										}
									}}
									on:transitionend={() => {
										if ($currentViewId === view.id) {
											$viewUnderline = true;
										}
									}}
									animate:flip={{ duration: $motion }}
									style:border-bottom={($highlightView || $viewUnderline) &&
									$currentViewId === view.id
										? borderStyle
										: '3px solid transparent'}
									style:opacity={$currentViewId === view.id ? '1' : '0.25'}
									style:transition="opacity {$motion}ms ease"
								>
									<div class="btn-content">
										{view.name}
									</div>
								</button>
							{/each}
						</div>
					</div>

					{#key $draggingView}
						<div
							class="underline"
							style:width="{width}px"
							style:left="{left}px"
							style:opacity={$draggingView ? '0' : '1'}
							style:transition="width {$motion}ms ease, left {$draggingView ? '0' : $motion}ms ease"
						></div>
					{/key}
				</div>
			</div>
		</section>
	{/if}
</nav>

<style>
	nav {
		margin-top: 1.35rem;
		grid-area: nav;
		padding: 0 2rem;
	}

	section {
		margin-bottom: 2rem;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		gap: 1.2rem;
	}

	.btn-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	#navigation {
		display: flex;
		gap: 1.2rem;
		padding: 0;
		position: relative;
		width: 100%;
		align-items: end;
		margin-top: 0.3rem;
	}

	#navigation button {
		color: white;
		background: none;
		border: none;
		font-weight: 700;
		cursor: pointer;
		font-size: 1.14rem;
		padding: 0;
		position: relative;
		padding-bottom: 3px;
		white-space: nowrap;
		scroll-snap-align: start;
		font-family: inherit;
	}

	.navigation-container {
		position: relative;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.navigation-container::-webkit-scrollbar {
		display: none;
	}

	.underline {
		position: absolute;
		bottom: 0rem;
		height: 3px;
		background: white;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		nav {
			padding: 0 1.25rem;
		}

		.navigation-container {
			width: calc(100vw - 160px) !important;
		}
	}
</style>
