<script lang="ts">
	import { konvaStore } from '$lib/Stores';
	import { dashboard, lang, record, states } from '$lib/Stores';
	import { onDestroy, onMount } from 'svelte';
	import TransformAttributes from '$lib/Modal/PictureElements/TransformAttributes.svelte';
	import SelectedAttributes from '$lib/Modal/PictureElements/SelectedAttributes.svelte';
	import Toolbar from '$lib/Modal/PictureElements/Toolbar.svelte';
	import KeyboardHandler from '$lib/Modal/PictureElements/KeyboardHandler.svelte';
	import ResizePanel from '$lib/Modal/PictureElements/ResizePanel.svelte';
	import TextPanel from '$lib/Modal/PictureElements/TextPanel.svelte';
	import ActionPanel from '$lib/Modal/PictureElements/ActionPanel.svelte';
	import ElementsPanel from '$lib/Modal/PictureElements/ElementsPanel.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import HelpOverlay from '$lib/Modal/PictureElements/HelpOverlay.svelte';

	export let sel: any;
	export let isOpen: boolean;
	export let demo: any | undefined = undefined;

	let konva: KonvaEditor;
	let container: HTMLDivElement;

	let canvas: HTMLDivElement;
	let offsetWidth: number;
	let offsetHeight: number;

	let panelsWidth = 300;
	let resizing = false;
	let showHelp = false;

	// helper function to parse event target value
	function setAttribute(id: string, key: string, event: Event) {
		const target = event.target as HTMLInputElement | null;
		if (target) konva.updateAttr(id, key, target.value);
	}

	// state shape and service target entities
	$: entityOptions = Object.keys($states || {}).sort((a, b) => a.localeCompare(b));

	// bridge konva and ui
	$: selectedShapes = $konvaStore?.selectedShapes;
	$: selectedShape = selectedShapes?.[0];

	// common
	$: props = {
		konva,
		selectedShapes,
		selectedShape
	};

	// responsive stage
	$: if (offsetWidth) {
		konva?.stage?.width(offsetWidth);
		konva?.updateGuidePos();
	}

	$: if (offsetHeight) {
		konva?.stage?.height(offsetHeight);
		konva?.updateGuidePos();
	}

	onMount(async () => {
		if (KonvaEditor && canvas) {
			konva = new KonvaEditor(canvas, {
				className: 'Stage',
				attrs: {
					width: canvas?.offsetWidth,
					height: canvas?.offsetHeight,
					id: sel?.id?.toString()
				},
				children: [
					{
						className: 'Layer',
						children: demo ? demo?.elements : sel?.elements || []
					}
				]
			});

			// focus the canvas element
			canvas.focus();
		}
	});

	onDestroy(() => {
		sel.elements = konva.getElementsData();
		konva?.destroyEditor?.();
		$dashboard = $dashboard;
		$record();
	});
</script>

<!-- keyboard shortcuts -->
<KeyboardHandler {konva} />

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{$lang('picture_elements')}</h1>

		<div class="modal-layout">
			<div
				data-exclude-drag-modal
				class="container"
				bind:this={container}
				style:grid-template-columns="3rem 1fr 0px {panelsWidth}px"
				style:cursor={resizing ? 'col-resize' : 'default'}
			>
				<div class="transform">
					<TransformAttributes {...props} {setAttribute} bind:showHelp />
				</div>

				<div class="selected">
					<SelectedAttributes {...props} {setAttribute} {entityOptions} />
				</div>

				<div class="toolbar">
					<Toolbar {konva} />
				</div>

				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					class="canvas"
					bind:this={canvas}
					bind:offsetWidth
					bind:offsetHeight
					tabindex="0"
				></div>

				<div class="resizer">
					<ResizePanel bind:resizing {container} bind:panelsWidth />
				</div>

				<div class="text-panel">
					<TextPanel {...props} {setAttribute} />
				</div>

				<div class="action-panel">
					<ActionPanel {...props} {entityOptions} />
				</div>

				<div class="elements-panel">
					<ElementsPanel {...props} />
				</div>

				{#if showHelp}
					<HelpOverlay bind:showHelp />
				{/if}
			</div>

			<div class="config-buttons">
				<ConfigButtons {sel} />
			</div>
		</div>
	</Modal>
{/if}

<style>
	.modal-layout {
		display: grid;
		grid-template-rows: 1fr auto;
		height: 75vh;
	}

	.container {
		position: relative;
		display: grid;
		grid-template-rows: 3rem 3rem auto auto 1fr;
		grid-template-areas:
			'transform transform transform transform'
			'selected selected selected selected'
			'toolbar canvas resizer text-panel'
			'toolbar canvas resizer action-panel'
			'toolbar canvas resizer elements-panel';
		background-color: rgba(255, 255, 255, 0.075);
		color: rgb(255, 255, 255);
		font-size: 14px;
		font-family: inherit;
		margin-top: 1rem;
		overflow: hidden;
		border-radius: 0.4rem;
		margin-bottom: -0.8rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.transform {
		grid-area: transform;
		/* border-top: 1px solid rgba(255, 255, 255, 0.2); */
	}

	.selected {
		grid-area: selected;
	}

	.toolbar {
		grid-area: toolbar;
		gap: 0.6rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 0.6rem;
		overflow-y: scroll;
		border-right: 1px solid rgba(255, 255, 255, 0.2);
	}

	.canvas {
		grid-area: canvas;
		background-color: rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.resizer {
		grid-area: resizer;
		display: flex;
	}

	.text-panel {
		grid-area: text-panel;
	}

	.action-panel {
		grid-area: action-panel;
	}

	.elements-panel {
		display: grid !important;
		grid-template-rows: min-content;
		grid-area: elements-panel;
	}

	.text-panel,
	.action-panel,
	.elements-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	/* Transform / Selected */

	:global(.konva-attribute-section) {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0 0.75rem 0 1rem;
		overflow: hidden;
		height: 100%;
	}

	:global(.konva-attribute) {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	:global(.konva-attribute input) {
		background-color: rgba(0, 0, 0, 0.35);
		padding: 0.3rem 0.5rem 0.35rem 0.5rem;
		width: 4.5rem;
		border: none;
		border-radius: 0.3rem;
		color: inherit;
	}

	:global(.konva-attribute input:disabled) {
		opacity: 0.5;
	}

	/* Action / Elements */

	:global(.konva-header) {
		display: grid;
		grid-template-columns: minmax(4rem, 1fr) auto;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.35);
		padding: 0 0.4rem 0 0.825rem;
		height: 2.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	:global(.konva-header .title) {
		display: grid;
		grid-template-columns: min-content 1fr;
		gap: 0.6rem;
	}

	:global(.konva-header h3) {
		font-family: system-ui;
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.konva-header .right) {
		display: flex;
		gap: 0.25rem;
		justify-self: end;
	}

	:global(.konva-header button) {
		all: unset;
		display: flex;
		cursor: pointer;
		border-radius: 0.5rem;
		padding: 0.35rem;
	}

	:global(.konva-header button:hover:not(:disabled)) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	:global(.konva-header button:active:not(:disabled)) {
		background-color: rgba(0, 0, 0, 0.2);
	}

	:global(.konva-header button:disabled) {
		opacity: 0.2;
		cursor: default;
	}
</style>
