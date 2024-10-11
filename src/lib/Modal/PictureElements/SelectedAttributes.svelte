<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import type { ShapeConfig } from 'konva/lib/Shape';
	import { icons } from '$lib/Modal/PictureElements/icons';

	export let konva: KonvaEditor;
	export let selectedShape: ShapeConfig;
	export let selectedShapes: ShapeConfig[];
	export let setAttribute: (id: string, key: string, event: Event) => void;
	export let entityOptions;

	let attributes: Record<string, any>[] = [];

	function handleInput(id: string, key: string, event: Event) {
		const target = event.target as HTMLInputElement | null;
		if (target) konva.updateAttr(id, key, target.value, true);
	}

	$: opacity = {
		id: 'opacity',
		label: 'Opacity',
		type: 'text',
		unit: '%',
		value:
			selectedShape?.attrs?.opacity != null ? Math.round(selectedShape?.attrs?.opacity * 100) : 100,
		disabled: !selectedShape?.attrs?.draggable
	};

	$: commonTextAttributes = [
		{
			id: 'box',
			label: 'Box',
			type: 'button',
			icon: icons['textBox'],
			selected: selectedShape?.attrs?.box,
			onclick: () => konva.toggleTextBox(selectedShape?.attrs?.id),
			disabled: !selectedShape?.attrs?.draggable
		},
		{
			id: 'fill',
			label: 'Color',
			type: 'color',
			value: selectedShape?.attrs?.fill,
			width: '2.5rem',
			disabled: !selectedShape?.attrs?.draggable
		},
		{ ...opacity }
	];

	$: if (selectedShape?.attrs?.type === 'icon') {
		// ICON
		attributes = [
			{
				id: 'icon',
				label: 'Icon',
				type: 'text',
				className: 'grow-item',
				disabled: !selectedShape.attrs.draggable,
				value: selectedShape.attrs.icon
			},
			{
				id: 'color',
				label: 'Color',
				type: 'color',
				width: '2.5rem',
				disabled: !selectedShape.attrs.draggable,
				value: selectedShape.attrs.color
			},
			{
				id: 'width',
				label: 'Width',
				type: 'text',
				unit: ' px',
				value: selectedShape.attrs.width,
				disabled: !selectedShape.attrs.draggable
			},
			{
				id: 'height',
				label: 'Height',
				type: 'text',
				unit: ' px',
				value: selectedShape.attrs.height,
				disabled: !selectedShape.attrs.draggable
			},
			{ ...opacity }
		];
	} else if (selectedShape?.attrs?.type === 'state-icon') {
		// STATE-ICON
		attributes = [
			{
				id: 'entity_id',
				label: 'Entity',
				type: 'text',
				className: 'grow-item',
				disabled: !selectedShape.attrs.draggable,
				value: selectedShape.attrs.entity_id,
				list: 'entityOptions'
			},
			{
				id: 'width',
				label: 'Width',
				type: 'text',
				unit: ' px',
				value: selectedShape.attrs.width,
				disabled: !selectedShape.attrs.draggable
			},
			{
				id: 'height',
				label: 'Height',
				type: 'text',
				unit: ' px',
				value: selectedShape.attrs.height,
				disabled: !selectedShape.attrs.draggable
			},
			{
				id: 'color',
				label: 'Color',
				type: 'color',
				width: '2.5rem',
				disabled: !selectedShape.attrs.draggable,
				value: selectedShape.attrs.color || selectedShape.attrs.state_color || '#ffffff'
			},
			{ ...opacity }
		];
	} else if (selectedShape?.attrs?.type === 'text') {
		// TEXT
		attributes = [
			{
				id: 'text',
				label: 'Text',
				value: selectedShape?.attrs?.text,
				type: 'textarea',
				className: 'grow-item',
				disabled: !selectedShape?.attrs?.draggable
			},
			...commonTextAttributes
		];
	} else if (selectedShape?.attrs?.type === 'state-label') {
		// STATE LABEL
		attributes = [
			{
				id: 'entity_id',
				label: 'Entity',
				value: selectedShape?.attrs?.entity_id,
				type: 'text',
				className: 'grow-item',
				disabled: !selectedShape?.attrs?.draggable,
				list: 'entityOptions'
			},
			...commonTextAttributes
		];
	} else if (selectedShape?.attrs?.type === 'image') {
		// IMAGE
		attributes = [
			{
				id: 'src',
				label: 'Source',
				value: selectedShape?.attrs?.src,
				type: 'text',
				className: 'grow-item',
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'width',
				label: 'Width',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.width,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'height',
				label: 'Height',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.height,
				disabled: !selectedShape?.attrs?.draggable
			},
			{ ...opacity }
		];
	} else if (selectedShape?.attrs?.type === 'rectangle') {
		// RECTANGLE
		attributes = [
			{
				id: 'width',
				label: 'Width',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.width,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'height',
				label: 'Height',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.height,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'fill',
				label: 'Fill',
				type: 'color',
				value: selectedShape?.attrs?.fill,
				width: '2.5rem',
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'cornerRadius',
				label: 'Radius',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.cornerRadius,
				disabled: !selectedShape?.attrs?.draggable
			},
			{ ...opacity }
		];
	} else if (selectedShape?.attrs?.type === 'circle') {
		// CIRCLE
		attributes = [
			{
				id: 'radius',
				label: 'Radius',
				type: 'text',
				unit: ' px',
				value: selectedShape?.attrs?.radius,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'fill',
				label: 'Fill',
				type: 'color',
				value: selectedShape?.attrs?.fill,
				width: '2.5rem',
				disabled: !selectedShape?.attrs?.draggable
			},
			{ ...opacity }
		];
	} else {
		// ELSE
		attributes = [];
	}

	function countGroupShapes(item: any): number {
		if (!item || typeof item !== 'object') return 0;

		let count = 0;

		if (item.className && item.className !== 'Group') {
			count = 1;
		} else if (Array.isArray(item.children)) {
			for (const child of item.children) {
				count += countGroupShapes(child);
			}
		}

		return count;
	}
</script>

<div class="konva-attribute-section">
	{#if selectedShapes?.length === 0}
		<!-- NONE -->
		<span class="icon">
			<Icon icon={icons?.['tip']} width="20" height="17" />
		</span>
		Click an element to select it
	{:else if selectedShapes?.length === 1}
		<!-- GROUP -->
		{#if selectedShape?.attrs?.type === 'group'}
			<span class="icon">
				<Icon icon={icons?.['group']} width="20" height="20" />
			</span>
			Group ({countGroupShapes(selectedShape)} elements)
		{:else}
			<!-- STANDARD -->
			<span class="icon">
				<Icon icon={icons?.[selectedShape?.attrs?.type]} width="20" height="20" />
			</span>
			{#each attributes as attr}
				<div class="konva-attribute" class:grow={attr?.className === 'grow-item'}>
					<label for={attr?.id}>
						{attr?.label}:
					</label>
					{#if attr.type === 'button'}
						<!-- button -->
						<button
							id={attr?.id}
							class:selected={attr?.selected}
							on:click={attr?.onclick}
							disabled={attr?.disabled}
						>
							<Icon icon={attr?.icon} width="20" height="20" />
						</button>
					{:else if attr.type === 'color'}
						<!-- on:input -->
						<input
							id={attr?.id}
							type={attr?.type}
							value={attr?.value}
							on:change={(event) => setAttribute(selectedShape?.attrs?.id, attr?.id, event)}
							on:input={(event) => handleInput(selectedShape?.attrs?.id, attr?.id, event)}
							style:width={attr?.width}
							disabled={attr?.disabled}
						/>
					{:else}
						<!-- on:change -->
						<input
							id={attr?.id}
							class={attr?.className}
							type={attr?.type}
							list={attr?.list}
							value={`${attr?.value ?? '0'}${attr?.unit || ''}`}
							on:change={(event) => setAttribute(selectedShape?.attrs?.id, attr?.id, event)}
							style:width={attr?.width}
							disabled={attr?.disabled}
						/>
					{/if}
				</div>
			{/each}
			<datalist id="entityOptions">
				{#each entityOptions as entityId}
					<option value={entityId}></option>
				{/each}
			</datalist>
		{/if}
	{:else if selectedShapes?.length > 1}
		<!-- MULTIPLE -->

		<span class="icon">
			<Icon icon={icons?.['shapes']} width="20" height="20" />
		</span>
		{selectedShapes?.length} elements selected
	{/if}
</div>

<style>
	.konva-attribute-section {
		display: flex;
		gap: 0.5rem;
	}

	.konva-attribute {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.grow {
		width: 100%;
		max-width: 39.4rem;
	}

	.grow-item {
		flex-grow: 1;
	}

	button {
		all: unset;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		border-radius: 0.4rem;
		height: 1.65rem;
		width: 1.65rem;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
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

	.icon {
		display: flex;
		margin-left: -0.1rem;
	}

	.konva-attribute input[type='color'] {
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
		height: 1.65rem;
	}

	input[type='color']::-moz-color-swatch {
		border: none;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
		border-radius: 0;
	}

	input[type='color']::-webkit-color-swatch {
		border: none;
	}
</style>
