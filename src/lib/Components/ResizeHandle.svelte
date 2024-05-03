<script lang="ts">
	import { dashboard, record, motion, editMode } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';

	let dragging: boolean;

	$: if (!dragging) $record();

	function handlePointer(event: PointerEvent) {
		const layoutElement: HTMLElement | null = document.getElementById('layout');
		if (!layoutElement) return;

		if (event?.type === 'pointerdown') {
			dragging = true;
			layoutElement.style.transition = 'none';
		} else if (event?.type === 'pointerup') {
			dragging = false;
			layoutElement.style.transition = `all ${$motion}ms ease`;
		}
	}

	function handlePointerMove(event: { clientX: number }) {
		if ($editMode && !dragging) return;

		const minMaxWidth = 100;
		const newWidth = Math.min(
			Math.max(event.clientX, minMaxWidth),
			window.innerWidth - minMaxWidth
		);
		$dashboard.sidebarWidth = Math.round(newWidth);
	}
</script>

<svelte:document on:pointermove={handlePointerMove} on:pointerup={handlePointer} />

<div class="handle" on:pointerdown={handlePointer}>
	<div class="area"></div>
</div>

<div class="icon" transition:fade={{ duration: $motion }}>
	<Icon icon="mdi:resize-bottom-right" height="none" />
</div>

<style>
	.handle {
		position: absolute;
		top: 0;
		right: -0.5em;
		bottom: 0;
		width: 1em;
		cursor: ew-resize;
		touch-action: none;
	}

	.area {
		position: absolute;
		height: 2.5em;
		width: 2.5rem;
		bottom: 0.4rem;
		right: 0.6rem;
		z-index: 1;
	}

	.icon {
		width: 2.5rem;
		position: absolute;
		bottom: 0.4rem;
		right: 0.6rem;
		opacity: 0.3;
	}
</style>
