<script lang="ts">
	import { konvaStore } from '$lib/Stores';
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import Icon from '@iconify/svelte';
	import type { ShapeConfig } from 'konva/lib/Shape';
	import { icons } from '$lib/Modal/PictureElements/icons';

	export let konva: KonvaEditor;
	export let selectedShape: ShapeConfig;
	export let selectedShapes: ShapeConfig[];
	export let setAttribute: (id: string, key: string, event: Event) => void;
	export let showHelp: boolean;

	let attributes: any[] = [];

	$: keepRatio = {
		id: 'keepRatio',
		type: 'button',
		label: 'Ratio (R)',
		icon: icons['chain'],
		onclick: () => {
			konva?.toggleKeepRatio();
			keepRatio.selected = konva?.transformer?.keepRatio() || false;
		},
		selected: konva?.transformer?.keepRatio() || false
	};

	$: if (selectedShapes?.length === 1 && selectedShape?.attrs?.box) {
		// TEXT-BOX
		attributes = [
			{
				id: 'x',
				label: 'X',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.x) || 0,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'y',
				label: 'Y',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.y) || 0,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'width',
				label: 'Width',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.width),
				disabled: !selectedShape?.attrs?.draggable
			},
			{ ...keepRatio },
			{
				id: 'height',
				label: 'Height',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.height),
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'rotation',
				label: 'Rotation',
				unit: '°',
				value: selectedShape?.attrs?.rotation
					? Number.parseFloat(selectedShape?.attrs?.rotation).toFixed(1)
					: 0,
				disabled: !selectedShape?.attrs?.draggable
			}
		];
	} else if (selectedShapes?.length === 1 && !selectedShape?.attrs?.type?.includes('-guide')) {
		// STANDARD
		attributes = [
			{
				id: 'x',
				label: 'X',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.x) || 0,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'y',
				label: 'Y',
				unit: ' px',
				value: Math.round(selectedShape?.attrs?.y) || 0,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'scaleX',
				label: 'Width',
				unit: '%',
				value: Math.round(selectedShape?.attrs?.scaleX * 100) || 100,
				handler: handleScaleChange,
				disabled: !selectedShape?.attrs?.draggable
			},
			{ ...keepRatio },
			{
				id: 'scaleY',
				label: 'Height',
				unit: '%',
				value: Math.round(selectedShape?.attrs?.scaleY * 100) || 100,
				handler: handleScaleChange,
				disabled: !selectedShape?.attrs?.draggable
			},
			{
				id: 'rotation',
				label: 'Rotation',
				unit: '°',
				value: selectedShape?.attrs?.rotation
					? Number.parseFloat(selectedShape?.attrs?.rotation).toFixed(1)
					: 0,
				disabled: !selectedShape?.attrs?.draggable
			}
		];
	} else {
		// NONE
		attributes = [
			{ id: 'x', label: 'X', unit: ' px', value: 0, disabled: true },
			{ id: 'y', label: 'Y', unit: ' px', value: 0, disabled: true },
			{ id: 'width', label: 'Width', unit: ' px', value: 0, disabled: true },
			{ ...keepRatio },
			{ id: 'height', label: 'Height', unit: ' px', value: 0, disabled: true },
			{ id: 'rotation', label: 'Rotation', unit: '°', value: 0, disabled: true }
		];
	}

	function handleInput(attribute: any, event: Event) {
		const target = event.target as HTMLInputElement;

		if (attribute.id === 'scaleX' || attribute.id === 'scaleY') {
			handleScaleChange(event, attribute.id);
		} else {
			const newValue = parseFloat(target.value);
			if (!isNaN(newValue)) {
				setAttribute(selectedShape.attrs.id, attribute.id, event);
			}
		}
	}

	function handleScaleChange(event: Event, property: 'scaleX' | 'scaleY') {
		const target = event.target as HTMLInputElement;
		const unitRemoved = target.value.replace(/%$/, '');
		const value = parseFloat(unitRemoved) / 100;
		konva.updateAttr(selectedShape.attrs.id, property, value);
	}
</script>

<div class="konva-attribute-section">
	{#each attributes as attr}
		<div class="konva-attribute">
			{#if attr.type === 'button'}
				<button
					on:click={attr?.onclick}
					on:dblclick={attr?.ondblclick}
					class:selected={attr?.selected}
					style:opacity={selectedShapes?.length > 0 && selectedShape?.attrs?.draggable
						? '1'
						: '0.5'}
					disabled={selectedShapes?.length < 1 && !selectedShape?.attrs?.draggable}
					title={attr?.label}
				>
					<Icon icon={attr?.icon} width="15" height="15" />
				</button>
			{:else}
				<label for={attr?.id}>
					{attr?.label}:
				</label>

				<input
					type="text"
					id={attr?.id}
					value={`${attr?.value ?? ''}${attr?.unit || ''}`}
					on:change={(event) => handleInput(attr, event)}
					disabled={attr?.disabled}
				/>
			{/if}
		</div>
	{/each}

	<div class="history">
		<!-- UNDO -->
		<button
			on:click={() => konva.undo()}
			title="Undo"
			disabled={!($konvaStore?.undoStack?.length > 1)}
		>
			<Icon icon={icons?.['undo']} />
		</button>

		<!-- REDO -->
		<button
			on:click={() => konva.redo()}
			title="Redo"
			disabled={!($konvaStore?.redoStack?.length > 0)}
		>
			<Icon icon={icons?.['redo']} />
		</button>

		<!-- HELP -->
		<button on:click={() => (showHelp = true)} title="Help">
			<Icon icon={icons?.['help']} />
		</button>
	</div>
</div>

<style>
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

	.history {
		display: flex;
		width: 100%;
		justify-content: end;
		gap: 0.2rem;
	}

	button:hover:not(.selected, :disabled) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	button:active:not(:disabled) {
		background-color: rgba(0, 0, 0, 0.1) !important;
	}

	.selected {
		background-color: rgba(0, 0, 0, 0.35);
	}

	button:disabled {
		opacity: 0.25;
		cursor: default;
	}
</style>
