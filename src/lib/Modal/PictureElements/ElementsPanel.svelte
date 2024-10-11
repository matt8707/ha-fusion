<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { Shape, ShapeConfig } from 'konva/lib/Shape';
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import { konvaStore } from '$lib/Stores';
	import Icon, { iconExists, loadIcon } from '@iconify/svelte';
	import { tick } from 'svelte';
	import { dragging } from '$lib/Stores';
	import { icons } from '$lib/Modal/PictureElements/icons';
	import { derived } from 'svelte/store';

	export let konva: KonvaEditor;
	export let selectedShape: ShapeConfig;
	export let selectedShapes: ShapeConfig[];

	let editingId: string | undefined = undefined;
	let dragStartOrder: string[] | undefined;

	let layers: any[];

	$: layers = $uiLayers?.children
		? [...$uiLayers.children].reverse().map((shape, index) => ({
				...shape,
				id: shape?.attrs?.id || `layer-${index}`
			}))
		: [];

	// derived store that only updates when not dragging
	const uiLayers: any = derived([konvaStore, dragging], ([$konvaStore, $dragging], set) => {
		if (!$dragging) set($konvaStore);
	});

	async function handleDragLayers(event: CustomEvent<DndEvent>) {
		$dragging = true;
		const id = event.detail.info.id;
		const items = event.detail.items;

		layers = items;

		if (!dragStartOrder) {
			dragStartOrder = [...$konvaStore.children].reverse().map((item) => item?.attrs?.id);
		}

		if (event.type === 'consider' && !selectedShapes.some((shape) => shape.attrs.id === id)) {
			konva.selectShapesById([id]);
		}

		if (event.type === 'finalize') {
			const selectedIds = selectedShapes.map((shape) => shape?.attrs?.id);
			const realItems = items.filter((item) => !item?.id?.startsWith('id:dnd-shadow-placeholder'));
			const isDraggedItemSelected = selectedIds.includes(id);

			if (isDraggedItemSelected) {
				// move all selected items
				const selected = dragStartOrder
					.filter((id) => selectedIds.includes(id))
					.map((id) => realItems.find((item) => item.id === id))
					.filter((item) => item !== undefined);

				const notSelected = realItems.filter((item) => !selectedIds.includes(item.id));
				// index of the dragged item
				const draggedIndex = realItems.findIndex((item) => item.id === id);

				let newArrangement;
				if (draggedIndex < notSelected.length) {
					newArrangement = [
						...notSelected.slice(0, draggedIndex),
						...selected,
						...notSelected.slice(draggedIndex)
					];
				} else {
					newArrangement = [...notSelected, ...selected];
				}

				layers = newArrangement;

				await tick();
				konva.selectShapesById(selectedIds);
			} else {
				// only move item
				layers = realItems;

				await tick();
				konva.selectShapesById([id]);
			}

			konva.reorderElements(layers.map((layer) => layer?.id));

			// reset
			$dragging = false;
			dragStartOrder = undefined;
		}
	}

	function transformDraggedElement(element: HTMLElement | undefined) {
		if (!element) return;

		Object.assign(element.style, {
			outline: 'none',
			opacity: '0.8'
		});
	}

	function handlePointerdown(event: MouseEvent) {
		if (!editingId) return;

		const currentInput = document.getElementById(editingId) as HTMLInputElement;
		if (currentInput && currentInput.contains(event.target as Node)) return;

		if (currentInput) {
			konva.updateAttr(editingId, 'name', currentInput.value);
		}

		editingId = undefined;
	}

	function handleKeydown(event: KeyboardEvent, shape: Shape) {
		const target = event.target as HTMLInputElement;

		if (event.key === 'Enter' || event.key === 'Tab') {
			konva.updateAttr(shape.attrs.id, 'name', target.value);
			editingId = undefined;
		}

		// escape undo
		else if (event.key === 'Escape') {
			target.value = shape?.attrs?.name;
			editingId = undefined;
		}
	}

	function handleImage(event: Event) {
		const image = event?.currentTarget as HTMLImageElement;
		const icon = image?.nextElementSibling as HTMLElement;
		const error = event?.type === 'error';

		image.style.display = error ? 'none' : 'block';
		icon.style.display = error ? 'block' : 'none';
	}

	function handleDragStart(id: string) {
		konva.selectShapesById([id]);
	}
</script>

<svelte:document on:pointerdown={handlePointerdown} />

<div class="konva-header">
	<div class="title">
		<Icon icon={icons['elements']} width="20" height="20" />

		<h3>Elements</h3>
	</div>

	<div class="right">
		<button
			title={selectedShape?.attrs?.draggable !== false ? 'Lock' : 'Unlock'}
			on:click={() => konva.toggleDraggable()}
			disabled={!selectedShape}
		>
			<Icon
				icon={icons?.[!selectedShape?.attrs?.draggable ? 'locked' : 'unlocked']}
				width="20"
				height="20"
			/>
		</button>

		<button title="Delete" on:click={() => konva.deleteSelected()} disabled={!selectedShape}>
			<Icon icon={icons?.['delete']} width="20" height="20" />
		</button>
	</div>
</div>

<div
	class="items"
	use:dndzone={{
		flipDurationMs: 0,
		dropTargetStyle: {},
		transformDraggedElement,
		items: layers
	}}
	on:consider={handleDragLayers}
	on:finalize={handleDragLayers}
>
	{#each layers as shape (shape.id)}
		{@const konvaStoreEquivalent = $konvaStore?.children?.find(
			(item) => item?.attrs?.id === shape?.attrs?.id
		)}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="item"
			animate:flip={{ duration: 0 }}
			class:selected={selectedShapes?.some((node) => node?.attrs?.id === shape?.attrs?.id)}
			on:dragstart={() => handleDragStart(shape?.attrs?.id)}
			on:click={async (event) => {
				// blur any active attr input to trigger onchange before switching layer
				if (
					document?.activeElement instanceof HTMLInputElement ||
					document?.activeElement instanceof HTMLTextAreaElement
				) {
					document?.activeElement?.blur?.();
					await tick();
				}
				konva.handleElementClick(event, shape?.attrs?.id);
			}}
		>
			<!-- VISIBILITY -->
			<button
				class="visibility"
				title={shape?.attrs?.visible === false ? 'Show' : 'Hide'}
				on:click|stopPropagation={() => konva.toggleVisibility(shape?.attrs?.id)}
			>
				<Icon
					icon={icons?.[shape?.attrs?.visible === false ? 'hidden' : 'visible']}
					width="20"
					height="20"
				/>
			</button>

			<!-- ICON -->
			<span class="icon">
				{#if shape?.attrs?.type === 'icon' || shape?.attrs?.type === 'state-icon'}
					{#if shape?.attrs?.type === 'state-icon' && !shape?.attrs?.entity_id}
						<Icon icon="mdi:lightbulb" width="20" height="20" />
					{:else if iconExists(konvaStoreEquivalent?.attrs?.icon)}
						<Icon icon={konvaStoreEquivalent?.attrs?.icon} width="20" height="20" />
					{:else}
						{#await loadIcon(konvaStoreEquivalent?.attrs?.icon)}
							<Icon icon={icons['broken']} width="20" height="20" />
						{:then iconName}
							<Icon icon={iconName} width="20" height="20" />
						{:catch}
							<Icon icon={icons['broken']} width="20" height="20" />
						{/await}
					{/if}
				{:else if shape?.attrs?.type === 'image'}
					<div class="thumbnail">
						<img
							src={konvaStoreEquivalent?.attrs?.src}
							alt=""
							width="20"
							height="20"
							on:load={handleImage}
							on:error={handleImage}
						/>
						<Icon icon={icons?.['broken']} width="20" height="20" style="display: none;" />
					</div>
				{:else}
					<Icon icon={icons?.[shape?.attrs?.type]} width="20" height="20" />
				{/if}
			</span>

			<!-- NAME -->
			{#if editingId === shape?.id}
				<!-- svelte-ignore a11y-autofocus -->
				<input
					id={shape?.id}
					type="text"
					class="editable"
					value={shape?.attrs?.name}
					on:keydown={(event) => handleKeydown(event, shape)}
					on:blur={() => (editingId = undefined)}
					on:click|stopPropagation
					autofocus={true}
				/>
			{:else}
				<span class="name editable" on:dblclick={() => (editingId = shape?.id)}>
					{shape?.attrs?.name}
				</span>
			{/if}

			<!-- INLINE LOCK -->
			{#if !shape?.attrs?.draggable}
				<button
					class="inline-lock"
					title="Unlock"
					on:click|stopPropagation={() => konva.toggleDraggable(shape?.attrs?.id)}
				>
					<Icon icon={icons['locked']} width="20" height="20" />
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.konva-header {
		border-bottom: none;
	}

	.items {
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}

	.item {
		padding: 0 0.46rem;
		display: grid;
		grid-template-columns: min-content min-content 1fr min-content;
		align-items: center;
		border-top: 1px solid rgba(0, 0, 0, 0.25);
		height: 3rem;
	}

	.item.selected {
		background-color: rgba(255, 255, 255, 0.1);
		border-top: 1px solid rgba(0, 0, 0, 0.35);
	}

	.icon {
		display: flex;
		margin-right: 0.4rem;
		margin-left: 0.6rem;
	}

	.thumbnail {
		width: 20px;
		height: 20px;
		overflow: hidden;
		border-radius: 0.15rem;
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.name {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		border: 1px solid transparent;
	}

	input {
		background-color: rgba(0, 0, 0, 0.35);
		border: 1px solid transparent;
		border-radius: 0.25rem;
		color: inherit;
	}

	.editable {
		font-size: inherit;
		font-family: inherit;
		padding: 0.25rem 0.45rem;
		margin: 0;
		width: 100%;
	}

	.visibility,
	.inline-lock {
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
	}

	.visibility:hover,
	.inline-lock:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
