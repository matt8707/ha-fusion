<script lang="ts">
	import { editMode, itemHeight, ripple, lang } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';

	export let sel: any;

	let container: HTMLDivElement;

	/**
	 * Delegate to handleEvent
	 */
	function handlePointer() {
		handleEvent({ type: 'preload' });
	}

	/**
	 * handleEvent
	 * pointerenter | pointerdown | click
	 */
	async function handleEvent(event: any) {
		if (event.type === 'click') {
			await handleClickEvent();
		} else {
			await handlePointerEvent();
		}
	}

	/**
	 * Handle click events
	 * Opens modal for specified domain
	 */
	async function handleClickEvent() {
		if ($editMode) {
			console.log('clicked Event in edit');
			openModal(() => import('$lib/Modal/EmptyConfig.svelte'), { sel });
		}
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointerEvent() {
		let module;

		if ($editMode) {
			module = await import('$lib/Modal/Unknown.svelte');
		}
		if (module) module.default;
	}
</script>

{#if $editMode}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		on:click|stopPropagation={handleEvent}
		class="container edit-mode"
		bind:this={container}
		tabindex="-1"
		style={!$editMode ? 'cursor: pointer;' : ''}
		style:height="{$itemHeight}px"
		on:pointerenter={handlePointer}
		on:pointerdown={handlePointer}
		use:Ripple={{ ...$ripple, color: !$editMode ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0)' }}
	></div>
{:else}
	<div
		class="container no-visible"
		bind:this={container}
		tabindex="-1"
		style:height="{$itemHeight}px"
		on:pointerenter={handlePointer}
		on:pointerdown={handlePointer}
	></div>
{/if}

<style>
	.no-visible {
		background-color: var(--theme-button-background-color-off);
		opacity: 0;
		font-family: inherit;
		width: 14.5rem;
		border-radius: 0.65rem;
		margin: 0;
	}

	.edit-mode {
		border-radius: 0.6rem;
		background-color: rgba(255, 255, 255, 0.25);
		outline: 2px dashed #fff;
		outline-offset: -2px;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		.container {
			width: calc(50vw - 1.45rem);
		}
	}
</style>
