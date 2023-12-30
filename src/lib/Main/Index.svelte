<script lang="ts">
	import { editMode, motion, record, dragging, itemHeight } from '$lib/Stores';
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import Content from '$lib/Main/Content.svelte';
	import SectionHeader from '$lib/Main/SectionHeader.svelte';
	import HorizontalStackHeader from '$lib/Main/HorizontalStackHeader.svelte';

	export let view: any;

	let isDraggingHorizontalStack = false;

	const stackHeight = $itemHeight * 1.65;

	$: dndOptions = {
		flipDurationMs: $motion,
		dragDisabled: !$editMode,
		dropTargetStyle: {},
		zoneTabIndex: -1,
		centreDraggedOnCursor: false
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

		if (event.type === 'finalize') {
			$record();
			$dragging = false;

			// reset body height
			await tick();
			document.body.style.height = 'auto';
		}
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
		if (event.type === 'finalize') isDraggingHorizontalStack = false;

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
				section.items = event.detail.items as any;
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
				section.items = event.detail.items;
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

	function sectionStyles(itemHeight: number, editMode: boolean, motion: number, empty: boolean) {
		return `
			min-height: ${itemHeight}px;
			background-color: ${empty ? 'rgba(255, 190, 10, 0.25)' : 'transparent'};
			outline: ${empty ? '2px dashed #ffc107' : 'none'};
			transition: ${
				editMode ? `background-color ${motion / 2}ms ease, min-height ${motion}ms ease` : 'none'
			};
    `;
	}

	function itemStyles(type: string) {
		return `
			grid-column: ${type === 'media' ? 'span 2' : 'span 1'};
			grid-row: ${type === 'media' ? 'span 4' : 'span 1'};
			display: ${type ? '' : 'none'};
    `;
	}
</script>

<main
	style:transition="opacity {$motion}ms ease, outline-color {$motion}ms ease"
	style:opacity={$editMode && view?.sections.length === 0 ? '0' : '1'}
	use:dndzone={{ ...dndOptions, type: 'section', items: view.sections }}
	on:consider={dragSection}
	on:finalize={dragSection}
>
	{#each view?.sections as section (section?.id)}
		<section
			id={String(section?.id)}
			data-is-dnd-shadow-item-hint={section?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
			animate:flip={{ duration: $motion }}
		>
			<!-- horizontal stack -->
			{#if section?.type === 'horizontal-stack'}
				<HorizontalStackHeader {view} {section} />

				<div
					class="horizontal-stack grid-flow-row md:grid-flow-col"
					style:min-height="{stackHeight}px"
					style:outline="2px dashed {$editMode ? '#ffc008' : 'transparent'}"
					style:transition="min-height {$motion}ms ease, outline {$motion / 2}ms ease"
					use:dndzone={{
						...dndOptions,
						type: isDraggingHorizontalStack ? 'stack' : 'section',
						items: section.sections
					}}
					on:consider={(event) => dragSection__stack(section.id, event)}
					on:finalize={(event) => dragSection__stack(section.id, event)}
				>
					{#each section?.sections as stackSection (stackSection.id)}
						{@const empty = $editMode && !stackSection?.items?.length}
						<section
							id={String(stackSection.id)}
							data-is-dnd-shadow-item-hint={stackSection?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
							animate:flip={{ duration: $motion }}
							style:overflow="hidden"
						>
							<SectionHeader {view} section={stackSection} />
							<div
								class="items"
								style={sectionStyles($itemHeight, $editMode, $motion, empty)}
								use:dndzone={{ ...dndOptions, type: 'item', items: stackSection.items }}
								on:consider={(event) => dragItem__stack(stackSection.id, event)}
								on:finalize={(event) => dragItem__stack(stackSection.id, event)}
							>
								<!-- item -->
								{#each stackSection?.items as item (item.id)}
									<div
										id={item?.id}
										data-is-dnd-shadow-item-hint={item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
										class="item"
										animate:flip={{ duration: $motion }}
										tabindex="-1"
										style={itemStyles(item?.type)}
									>
										<Content {item} />
									</div>
								{/each}
							</div>
						</section>
					{/each}
				</div>

				<!-- normal -->
			{:else}
				{@const empty = $editMode && !section?.items?.length}
				<SectionHeader {view} {section} />
				<div
					class="items"
					style={sectionStyles($itemHeight, $editMode, $motion, empty)}
					use:dndzone={{ ...dndOptions, type: 'item', items: section.items }}
					on:consider={(event) => dragItem(section.id, event)}
					on:finalize={(event) => dragItem(section.id, event)}
				>
					{#each section?.items as item (item.id)}
						<div
							id={item?.id}
							data-is-dnd-shadow-item-hint={item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
							class="item"
							animate:flip={{ duration: $motion }}
							tabindex="-1"
							style={itemStyles(item?.type)}
						>
							<Content {item} />
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
		padding: 0 2rem 2rem 2rem;
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
		grid-auto-columns: 1fr;
		gap: 0.4rem;
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
</style>
