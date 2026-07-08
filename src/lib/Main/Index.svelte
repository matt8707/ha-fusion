<script lang="ts">
	import { editMode, motion, record, dragging, itemHeight, states, dashboard } from '$lib/Stores';
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone, TRIGGERS, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import Content from '$lib/Main/Content.svelte';
	import SectionHeader from '$lib/Main/SectionHeader.svelte';
	import HorizontalStackHeader from '$lib/Main/HorizontalStackHeader.svelte';
	import Scenes from '$lib/Main/Scenes.svelte';
	import { handleVisibility, handleItemVisibility, mediaQueries } from '$lib/Conditional';
	import { generateId } from '$lib/Utils';

	export let view: any;
	export let altKeyPressed: boolean;

	let currentDraggedElement: HTMLElement | undefined;
	let dragEnteredAnother = false;

	let isDraggingHorizontalStack = false;
	let isDraggingScenes = false;
	let skipTransformElement = false;

	const stackHeight = $itemHeight * 1.65;

	let mounted = false;
	onMount(() => (mounted = true));

	$: dndOptions = {
		flipDurationMs: $motion,
		dragDisabled: !$editMode,
		dropTargetStyle: {},
		zoneTabIndex: -1
	};

	/**
	 * Drag and drop common code.
	 *
	 * Set `$dragging` to prevent exiting edit mode while mutations happen,
	 * then on 'finalize' snapshot current dashboard to history.
	 */
	async function handleDrag(event: CustomEvent<DndEvent>, callback: () => void) {
		$dragging = true;

		// increase body height to prevent scroll position from jumping...
		document.body.style.height = `${parseFloat(getComputedStyle(document.body).height) + 1}px`;

		// // disable consider min-height
		// (event.target as HTMLDivElement).style.minHeight = `${$itemHeight}px`;

		// handle dnd type
		callback();

		// set cross type flag
		if (!dragEnteredAnother && event?.detail?.info?.trigger === 'dragEnteredAnother') {
			dragEnteredAnother = true;
		}

		if (event.type === 'finalize') {
			$record();

			// reset variables
			$dragging = false;
			dragEnteredAnother = false;
			currentDraggedElement = undefined;
			skipTransformElement = false;

			// reset body height
			await tick();
			document.body.style.height = 'auto';
		}
	}

	/**
	 * Duplicates dragged item when Alt key is pressed during drag start
	 */
	function handleCopyOnDrag(items: any[], event: CustomEvent<DndEvent>) {
		const { trigger, id: itemId } = event.detail.info;

		if (trigger === TRIGGERS.DRAG_STARTED && altKeyPressed) {
			const idx = items.findIndex((item) => item.id === itemId);
			const newId = generateId($dashboard);

			event.detail.items = event.detail.items.filter(
				(item) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]
			);
			event.detail.items.splice(idx, 0, { ...items[idx], id: newId });
		}

		return event.detail.items;
	}

	/**
	 * Handles the reordering of sections within a view when they are dragged
	 *
	 * Also checks if currently dragged section is a horizontal stack,
	 * and sets dnd type to prevent recursively stacking stacks.
	 */
	function dragSection(event: CustomEvent<DndEvent>) {
		const matchedSection = event.detail.items.find((section) =>
			[event?.detail?.info?.id, 'id:dnd-shadow-placeholder-0000'].includes(section.id)
		);

		isDraggingHorizontalStack = matchedSection?.type === 'horizontal-stack';
		isDraggingScenes = matchedSection?.type === 'scenes';

		if (event.type === 'finalize') {
			isDraggingScenes = false;
			isDraggingHorizontalStack = false;
		}

		handleDrag(event, () => {
			if (view) view.sections = event.detail.items;
		});
	}

	/**
	 * Handles the reordering of items within a section when they are dragged
	 */
	function dragItem(id: number, event: CustomEvent<DndEvent>) {
		handleDrag(event, () => {
			const section = view?.sections.find((sec: { id: number }) => sec.id === id);

			if (section) {
				section.items = handleCopyOnDrag(section.items, event);
				view.sections = [...view.sections];
			}
		});
	}

	/**
	 * Handles the reordering of sections within a horizontal stack when they are dragged
	 */
	function dragSection__stack(id: number, event: CustomEvent<DndEvent>) {
		handleDrag(event, () => {
			const stack = view?.sections.find(
				(section: { id: number; type: string }) =>
					section.id === id && section.type === 'horizontal-stack'
			);

			if (stack) {
				stack.sections = event.detail.items as any;
				view.sections = [...view.sections];
			}
		});
	}

	/**
	 * Handles the reordering of items within a horizontal stack when they are dragged
	 */
	function dragItem__stack(id: number, event: CustomEvent<DndEvent>) {
		handleDrag(event, () => {
			const section = view?.sections
				.find((section: { sections: { id: number }[] }) =>
					section.sections?.some((sub: { id: number }) => sub.id === id)
				)
				?.sections.find((sub: { id: number }) => sub.id === id);

			if (section) {
				section.items = handleCopyOnDrag(section.items, event);
				view.sections = [...view.sections];
			}
		});
	}

	/**
	 * The styles a constructed in a function to not have to repeat them inline.
	 *
	 * This is because of 'horizontal-stack'; it's not possible to make code
	 * recursive or use reusable components without breaking flip-animations.
	 */

	function sectionStyles(sectionType: string, editMode: boolean, motion: number, empty: boolean) {
		return `
			min-height: ${sectionType === 'scenes' ? '4.8rem' : `${$itemHeight}px`};
			background-color: ${empty ? 'rgba(255, 190, 10, 0.25)' : sectionType === 'scenes' ? 'rgba(0, 0, 0, 0.125)' : 'transparent'};
			outline: ${empty ? '2px dashed #ffc107' : 'none'};
			transition: ${
				editMode ? `background-color ${motion / 2}ms ease, min-height ${motion}ms ease` : 'none'
			};
    `;
	}

	function itemStyles(type: string) {
		const large = ['conditional_media', 'picture_elements', 'camera'];
		return `
			grid-column: ${large.includes(type) ? 'span 2' : 'span 1'};
			grid-row: ${large.includes(type) ? 'span 4' : 'span 1'};
			display: ${type ? '' : 'none'};
    `;
	}

	/**
	 * dnd transformDraggedElement
	 */
	function transformDraggedElement(element: HTMLElement | undefined) {
		if (element) transformElement(element);
	}

	/**
	 * Helper function to transform the dragged element
	 */
	function transformElement(element: HTMLElement) {
		const container = element.firstElementChild as HTMLElement;
		if (!container) return;

		const pictureElement = container?.firstElementChild?.className === 'konvajs-content';

		if (!altKeyPressed) skipTransformElement = true;

		// alt-duplicate add yellow outline
		if (!skipTransformElement) {
			Object.assign(container.style, {
				outline: '2px dashed rgb(255, 192, 8)',
				outlineOffset: '-2px',
				borderRadius: '0.65rem'
			});

			// if picture element set z-index on konva
			// container to be able to see the outline...
			if (pictureElement) {
				const konva = container.firstElementChild as HTMLElement;
				if (konva) konva.style.zIndex = '-1';
			}
		}
	}

	/**
	 * Transforms the dragged element for scene
	 * items and triggers acrossTypeTransform
	 */
	function transformScenesElement(element: HTMLElement | undefined) {
		if (!element) return;
		transformElement(element);

		// scene transformation
		if (!currentDraggedElement) currentDraggedElement = element;

		Object.assign(element.style, {
			overflow: 'hidden',
			borderRadius: '0.65rem',
			border: 'none'
		});
	}

	$: if (dragEnteredAnother && currentDraggedElement) {
		acrossTypeTransform(currentDraggedElement);
	}

	function acrossTypeTransform(currentDraggedElement: HTMLElement) {
		currentDraggedElement.innerHTML = '';
		const div = document.createElement('div');

		Object.assign(div.style, {
			outline: 'rgb(255, 192, 8) dashed 2px',
			outlineOffset: '-2px',
			backgroundColor: 'rgba(255, 190, 10, 0.25)',
			width: 'inherit',
			height: 'inherit',
			'border-radius': 'inherit'
		});

		currentDraggedElement.appendChild(div);
	}

	/**
	 * If $editMode is true, return the original view sections
	 * Otherwise filter the sections based on current states and conditions.
	 *
	 * This statement reactively updates when any of the following change:
	 * $editMode, mounted, $mediaQueries, view?.sections, $states
	 */
	$: viewSections = $editMode
		? view?.sections
		: typeof mounted === 'boolean' &&
			typeof $mediaQueries === 'object' &&
			handleVisibility($editMode, view?.sections, $states);
</script>

<main
	style:transition="opacity {$motion}ms ease, outline-color {$motion}ms ease"
	style:opacity={$editMode && view?.sections.length === 0 ? '0' : '1'}
	use:dndzone={{ ...dndOptions, type: 'section', items: view.sections }}
	on:consider={dragSection}
	on:finalize={dragSection}
>
	{#each viewSections as section (`${section?.id}${section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? '_' + section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ''}`)}
		<section
			id={String(section?.id)}
			data-is-dnd-shadow-item-hint={section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
			animate:flip={{ duration: $motion }}
		>
			<!-- horizontal stack -->
			{#if section?.type === 'horizontal-stack'}
				<HorizontalStackHeader {view} {section} />

				<div
					class="horizontal-stack"
					style:min-height="{stackHeight}px"
					style:outline="2px dashed {$editMode ? '#ffc008' : 'transparent'}"
					style:transition="min-height {$motion}ms ease, outline {$motion / 2}ms ease"
					data-is-dnd-shadow-item-hint={section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
					use:dndzone={{
						...dndOptions,
						type: isDraggingHorizontalStack ? 'stack' : isDraggingScenes ? 'scenes' : 'section',
						items: section.sections
					}}
					on:consider={(event) => dragSection__stack(section.id, event)}
					on:finalize={(event) => dragSection__stack(section.id, event)}
				>
					{#each section?.sections as stackSection (`${stackSection?.id}${stackSection?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? '_' + stackSection?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ''}`)}
						{@const empty = $editMode && !stackSection?.items?.length}
						{@const visibleItems = $editMode ? stackSection?.items : handleItemVisibility($editMode, stackSection?.items, $states, stackSection)}
						<section
							id={String(stackSection.id)}
							data-is-dnd-shadow-item-hint={stackSection?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
							animate:flip={{ duration: $motion }}
							style:overflow="hidden"
						>
							<SectionHeader {view} section={stackSection} />
							<div
								class="items"
								data-is-dnd-shadow-item-hint={stackSection?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
								style={sectionStyles(section?.type, $editMode, $motion, empty)}
								use:dndzone={{
									...dndOptions,
									type: 'item',
									items: stackSection.items,
									transformDraggedElement
								}}
								on:consider={(event) => dragItem__stack(stackSection.id, event)}
								on:finalize={(event) => dragItem__stack(stackSection.id, event)}
							>
								<!-- item -->
								{#each visibleItems as item (item.id)}
									<div
										id={item?.id}
										data-is-dnd-shadow-item-hint={item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
										class="item"
										animate:flip={{ duration: $motion }}
										tabindex="-1"
										style={itemStyles(item?.type)}
									>
										<Content {item} sectionName={stackSection?.name} />
									</div>
								{/each}
							</div>
						</section>
					{/each}
				</div>

				<!-- scenes -->
			{:else if section?.type === 'scenes'}
				{@const empty = $editMode && !section?.items?.length}
				{@const visibleItems = $editMode ? section?.items : handleItemVisibility($editMode, section?.items, $states, section)}
				<SectionHeader {view} {section} />
				<div
					class="scenes"
					style={sectionStyles(section?.type, $editMode, $motion, empty)}
					data-is-dnd-shadow-item-hint={section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
					use:dndzone={{
						...dndOptions,
						type: 'item',
						items: section.items,
						transformDraggedElement: transformScenesElement
					}}
					on:consider={(event) => dragItem(section.id, event)}
					on:finalize={(event) => dragItem(section.id, event)}
				>
					{#each visibleItems as item, index (item.id)}
						<div
							id={item?.id}
							data-is-dnd-shadow-item-hint={item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
							animate:flip={{ duration: $motion }}
							tabindex="-1"
							class:divider={index !== visibleItems?.length - 1}
						>
							<Scenes sel={item} />
						</div>
					{/each}
				</div>

				<!-- normal -->
			{:else}
				{@const empty = $editMode && !section?.items?.length}
				{@const visibleItems = $editMode ? section?.items : handleItemVisibility($editMode, section?.items, $states, section)}

				<SectionHeader {view} {section} />

				<div
					class="items"
					data-is-dnd-shadow-item-hint={section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
					style={sectionStyles(section?.type, $editMode, $motion, empty)}
					use:dndzone={{
						...dndOptions,
						type: 'item',
						items: section.items,
						transformDraggedElement
					}}
					on:consider={(event) => dragItem(section.id, event)}
					on:finalize={(event) => dragItem(section.id, event)}
				>
					{#each visibleItems as item (item.id)}
						<div
							id={item?.id}
							data-is-dnd-shadow-item-hint={item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
							class="item"
							animate:flip={{ duration: $motion }}
							tabindex="-1"
							style={itemStyles(item?.type)}
						>
							<Content {item} sectionName={section?.name} />
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/each}
</main>

<style>
	main {
		grid-area: main;
		padding: 0 2rem 2rem;
		display: grid;
		gap: 1.5rem;
		outline: transparent;
		align-content: start;
	}

	section {
		display: grid;
		align-content: start;
	}

	.horizontal-stack {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 2rem;
		border-radius: 0.65rem;
		outline-offset: 3px;
	}

	.items {
		border-radius: 0.6rem;
		outline-offset: -2px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 14.5rem);
		grid-auto-rows: min-content;
		gap: 0.4rem;
		border-radius: 0.6rem;
		height: 100%;
	}

	.item {
		position: relative;
		border-radius: 0.65rem;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		main {
			padding: 0 1.25rem 1.25rem 1.25rem;
		}

		.horizontal-stack {
			grid-auto-flow: row;
			gap: 1.5rem;
		}

		.items {
			display: flex;
			flex-wrap: wrap;
		}
	}

	.scenes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		border-radius: 0.65rem;
		overflow: hidden;
		min-height: 5rem;
	}

	.scenes > .divider {
		border-right: 1px solid transparent;
	}
</style>
