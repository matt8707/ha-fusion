<script lang="ts">
	import { dashboard, dragging, lang, motion, record, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import AddConditionButtons from '$lib/Modal/VisibilityConfig/AddConditionButtons.svelte';
	import StateCondition from '$lib/Modal/VisibilityConfig/StateCondition.svelte';
	import NumericCondition from '$lib/Modal/VisibilityConfig/NumericCondition.svelte';
	import ScreenCondition from '$lib/Modal/VisibilityConfig/ScreenCondition.svelte';
	import { onDestroy } from 'svelte';
	import type { Condition } from '$lib/Types';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import Explanation from '$lib/Modal/VisibilityConfig/Explanation.svelte';
	import ItemHeader from '$lib/Modal/VisibilityConfig/ItemHeader.svelte';
	import { closeModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { generateId } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: any;
	export let isItemTemplate = false;

	let innerWidth = 0;
	let draggingGroup = false;
	let draggedElHeight: number | undefined;
	let matches: { [key: string]: boolean } = {};

	/**
	 * Determine which visibility property to use
	 */
	$: visibilityKey = isItemTemplate ? 'item_visibility_template' : 'visibility';

	/**
	 * Capture dashboard reference for ID generation
	 * to avoid reactive recalculation on every dashboard change
	 */
	let dashboardSnapshot = $dashboard;

	/**
	 * Track the source data to detect actual changes
	 */
	let previousVisibilityData: string | undefined;
	let items: any[] = [];

	/**
	 * Add id's to each item
	 * Only regenerate when modal opens or source data changes
	 */
	$: visibilityData = sel?.[visibilityKey];

	$: if (isOpen) {
		const currentData = JSON.stringify(visibilityData);
		if (currentData !== previousVisibilityData) {
			dashboardSnapshot = $dashboard;
			previousVisibilityData = currentData;
			items =
				visibilityData?.map((item: Condition) => ({
					id: generateId(dashboardSnapshot),
					...item,
					...(item.condition === 'and' || item.condition === 'or'
						? {
								conditions: item.conditions?.map((condition: Condition) => ({
									id: generateId(dashboardSnapshot),
									...condition
								}))
							}
						: {})
				})) || [];
		}
	}

	/**
	 * dnd
	 */

	const dndOptions = {
		flipDurationMs: $motion,
		dropTargetStyle: {},
		transformDraggedElement
	};

	function dragItem(event: CustomEvent<DndEvent>) {
		const draggedItem = event.detail.items.find((section) =>
			[event?.detail?.info?.id, 'id:dnd-shadow-placeholder-0000'].includes(section.id)
		);

		if (draggedItem && (draggedItem.condition === 'and' || draggedItem.condition === 'or')) {
			draggingGroup = true;
		}

		handleDrag(event, () => {
			items = event.detail.items;
		});
	}

	function dragNestedItem(id: string, event: CustomEvent<DndEvent>) {
		handleDrag(event, () => {
			const condition = items.find((item: any) => item.id === id);

			if (condition && condition.conditions) {
				condition.conditions = event.detail.items;
				items = [...items];
			}
		});
	}

	function handleDrag(event: CustomEvent<DndEvent>, callback: () => void) {
		$dragging = true;

		callback();

		// reset
		if (event.type === 'finalize') {
			$dragging = false;
			draggingGroup = false;
			draggedElHeight = undefined;
		}
	}

	/**
	 * Fix visual bugs on dnd
	 *
	 * - hide entity select list if open on dragging
	 * - force fixed element height when dragging
	 */
	function transformDraggedElement(draggedEl: HTMLElement | undefined) {
		if (!draggedEl) return;

		const listOpen = draggedEl.querySelector('.wrapper') as HTMLElement;
		if (listOpen) listOpen.style.display = 'none';

		if (!draggedElHeight) draggedElHeight = draggedEl.offsetHeight;
		if (draggedElHeight) draggedEl.style.height = `${draggedElHeight}px`;
	}

	/**
	 * Get all 'screen' conditions
	 * { id, media_query }
	 */
	$: screenConditions = items.flatMap((item: Condition) =>
		item.condition === 'screen'
			? [{ id: item.id, media_query: item.media_query }]
			: item.condition === 'and' || item.condition === 'or'
				? (item.conditions
						?.filter((cond) => cond.condition === 'screen')
						.map(({ id, media_query }) => ({ id, media_query })) ?? [])
				: []
	);

	/**
	 * Updates `matches`
	 */
	$: if (screenConditions) updateMatches();

	function updateMatches() {
		matches = Object.fromEntries(
			screenConditions.map((item: { id: string; media_query: string }) => [
				item.id,
				typeof item.media_query === 'string' && item.media_query !== ''
					? window.matchMedia(item.media_query).matches
					: false
			])
		);
	}

	/**
	 * Removes all conditions, which in turn also triggers onDestroy
	 */
	function handleRemove() {
		delete sel?.[visibilityKey];
		sel = { ...sel };
		closeModal();
	}

	/**
	 * When modal is closed remove any `id` and `collapsed` keys
	 * and add transformed items to dashboard section visibility or item_visibility_template
	 */
	onDestroy(() => {
		sel[visibilityKey] = items?.map((item: Condition) => {
			const condition = { ...item };
			delete condition.id;
			delete condition.collapsed;

			if (condition.conditions) {
				condition.conditions = condition.conditions.map((nestedItem: Condition) => {
					const nested = { ...nestedItem };
					delete nested.id;
					delete nested.collapsed;
					return nested;
				});
			}

			return condition;
		});

		if (!sel[visibilityKey]?.length) {
			delete sel[visibilityKey];
		}

		$dashboard = $dashboard;

		$record();
	});
</script>

<svelte:window on:resize={updateMatches} bind:innerWidth />

{#if isOpen}
	<Modal>
		<h1 slot="title">
			{isItemTemplate ? $lang('item_visibility_template') : $lang('visibility')}
		</h1>

		<Explanation {sel} {items} {matches} {isItemTemplate} />

		<AddConditionButtons bind:items />

		{#if items}
			<section
				data-exclude-drag-modal
				style:padding="1.5rem 0"
				use:dndzone={{
					...dndOptions,
					type: 'condition',
					items
				}}
				on:consider={dragItem}
				on:finalize={dragItem}
			>
				{#each items as item (`${item?.id}${item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? '_' + item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ''}`)}
					<div
						data-is-dnd-shadow-item-hint={item?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
						class:item
						animate:flip={{ duration: $motion }}
					>
						<ItemHeader bind:item bind:items {matches} {innerWidth} />

						{#if !item?.collapsed}
							<div class="content" transition:slide={{ duration: $motion, easing: expoOut }}>
								{#if item?.condition === 'state' && !item?.collapsed}
									<StateCondition {item} bind:items {isItemTemplate} />
								{:else if item?.condition === 'numeric_state' && !item?.collapsed}
									<NumericCondition {item} bind:items />
								{:else if item?.condition === 'screen' && !item?.collapsed}
									<ScreenCondition {item} bind:items />
								{:else if item?.condition === 'and' || item?.condition === 'or'}
									<!-- nested -->
									<!-- code can be reduced with snippets -->

									{#if item?.conditions}
										{@const empty = !item?.conditions?.length}

										<section
											data-exclude-drag-modal
											class="nested"
											style:background-color={empty ? 'rgba(255, 190, 10, 0.25)' : 'transparent'}
											style:outline={empty ? '2px dashed #ffc107' : 'none'}
											style:transition="background-color {$motion}ms ease"
											use:dndzone={{
												...dndOptions,
												type: draggingGroup ? 'group' : 'condition',
												items: item?.conditions
											}}
											on:consider={(event) => dragNestedItem(item.id, event)}
											on:finalize={(event) => dragNestedItem(item.id, event)}
										>
											{#each item.conditions as subItem (`${subItem?.id}${subItem?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? '_' + subItem?.[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ''}`)}
												<div
													data-is-dnd-shadow-item-hint={subItem?.[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
													class="item"
													animate:flip={{ duration: $motion }}
												>
													<ItemHeader bind:item={subItem} bind:items {matches} {innerWidth} />

													{#if !subItem.collapsed}
														<div
															class="content"
															transition:slide={{ duration: $motion, easing: expoOut }}
														>
															{#if subItem?.condition === 'state' && !subItem?.collapsed}
																<StateCondition item={subItem} bind:items={item.conditions} {isItemTemplate} />
															{:else if subItem?.condition === 'numeric_state' && !subItem?.collapsed}
																<NumericCondition item={subItem} bind:items={item.conditions} />
															{:else if subItem?.condition === 'screen' && !subItem?.collapsed}
																<ScreenCondition item={subItem} bind:items={item.conditions} />
															{/if}
														</div>
													{/if}
												</div>
											{/each}
										</section>
									{/if}

									<!-- / nested -->
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>
		{/if}

		<div class="add-config-buttons">
			<button
				class="action remove"
				on:click={handleRemove}
				use:Ripple={{ ...$ripple, color: !items?.length ? 'transparent' : $ripple.color }}
				style:cursor={!items?.length ? 'initial' : 'pointer'}
				style:opacity={!items?.length ? '0.3' : 'initial'}
				disabled={!items?.length}
			>
				{$lang('remove')}
			</button>

			<button class="action done" on:click={closeModal} use:Ripple={$ripple}>
				{$lang('done')}
			</button>
		</div>
	</Modal>
{/if}

<style>
	section {
		display: flex;
		flex-flow: column;
		gap: 1rem;
	}

	.nested {
		min-height: 8.6rem;
		border-radius: calc(1.2rem - 0.6em) calc(1.2rem - 0.6em);
		outline-offset: -2px;
	}

	.item {
		border: 1px solid rgba(255, 255, 255, 0.25);
		padding: 1rem 1.1rem 1.1rem 1.1rem;
		border-radius: calc(1.2rem - 0.6em);
		background-color: rgba(255, 255, 255, 0.05);
	}

	.content {
		padding-top: 0.8rem;
	}

	.add-config-buttons {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	:global(.evaluate-condition) {
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
		border-radius: 0.35rem;
		height: 1.6rem;
		text-transform: uppercase;
		font-weight: 500;
		align-content: center;
		line-height: 1.25rem;
		width: fit-content;
	}

	:global(.evaluate-condition.visible) {
		background-color: #007800;
	}

	:global(.evaluate-condition.hidden) {
		background: #ffc008;
		color: #3b0f0f;
	}
</style>
