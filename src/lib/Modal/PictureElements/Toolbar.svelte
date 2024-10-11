<script lang="ts">
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import { konvaStore } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import { icons } from '$lib/Modal/PictureElements/icons';

	export let konva: KonvaEditor;
</script>

<button
	title="Select (V), Double-click to Deselect All"
	on:click={() => konva.setMode('default')}
	on:dblclick={() => {
		konva.deselectAll();
		if ($konvaStore?.selectedShapes) {
			$konvaStore.selectedShapes = [];
		}
	}}
	class:selected={$konvaStore?.mode === 'default'}
>
	<Icon icon={icons?.['default']} width="15" height="15" />
</button>

<button
	title="Pan (H), Double-click to Fit Canvas"
	on:click={() => konva.setMode('pan')}
	on:dblclick={() => konva.fitCanvas()}
	class:selected={$konvaStore?.mode === 'pan'}
>
	<Icon icon={icons?.['pan']} width="15" height="15" />
</button>

<button
	title="Zoom (Z), Double-click to Reset Zoom"
	on:click={() => konva.setMode('zoom')}
	on:dblclick={() => {
		konva.setZoom('reset', {
			x: konva.stage.width() / 2,
			y: konva.stage.height() / 2
		});
	}}
	class:selected={$konvaStore?.mode === 'zoom'}
>
	<Icon icon={icons?.['zoom']} width="15" height="15" />
</button>

<span class="divider"></span>

<button title="Add New State Label" on:click={() => konva.addStateLabel()}>
	<Icon icon={icons?.['state-label']} width="18" height="18" />
</button>

<button title="Add New State Icon" on:click={() => konva.addStateIcon()}>
	<Icon icon={icons?.['state-icon']} width="20" height="20" />
</button>

<span class="divider"></span>

<button title="Add New Text" on:click={() => konva.addText()}>
	<Icon icon={icons?.['text']} width="20" height="20" />
</button>

<button title="Add New Icon" on:click={() => konva.addIcon()}>
	<Icon icon={icons?.['icon']} width="18" height="18" />
</button>

<button title="Add New Image" on:click={() => konva.addImage()}>
	<Icon icon={icons?.['image']} width="18" height="18" />
</button>

<button title="Add New Rectangle" on:click={() => konva.addRectangle()}>
	<Icon icon={icons?.['rectangle']} width="18" height="18" />
</button>

<button title="Add New Circle" on:click={() => konva.addCircle()}>
	<Icon icon={icons?.['circle']} width="18" height="18" />
</button>

<span class="divider"></span>

<button title="Add New Vertical Guide" on:click={() => konva.addVerticalGuide()}>
	<Icon icon={icons?.['v-guide']} width="16" height="16" />
</button>

<button title="Add New Horizontal Guide" on:click={() => konva.addHorizontalGuide()}>
	<Icon icon={icons?.['h-guide']} width="16" height="16" />
</button>

<style>
	button {
		all: unset;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		border-radius: 0.4rem;
		width: 2rem;
		aspect-ratio: 1 / 1;
		justify-content: center;
		align-items: center;
		margin-left: 1px;
	}

	.divider {
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		border-top: 1px solid rgba(0, 0, 0, 0.15);
		height: 2px;
		width: 1.3rem;
		margin: 0.45rem;
	}

	button:hover:not(.selected) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	button:active {
		background-color: rgba(0, 0, 0, 0.1) !important;
	}

	.selected {
		background-color: rgba(0, 0, 0, 0.35);
	}
</style>
