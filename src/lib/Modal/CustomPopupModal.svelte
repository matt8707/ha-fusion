<script lang="ts">
	import { dashboard } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { editMode, motion, itemHeight } from '$lib/Stores';
	import { flip } from 'svelte/animate';
	import Content from '$lib/Main/Content.svelte';
	import SectionHeader from '$lib/Main/SectionHeader.svelte';
	import HorizontalStackHeader from '$lib/Main/HorizontalStackHeader.svelte';
	import type { PopupItem } from '$lib/Types';

	export let isOpen: boolean;

	export let popup: string | undefined;

	let view: PopupItem | undefined;

	view = $dashboard.popups?.find(
			(p) => p.name === popup
		)

	const stackHeight = $itemHeight * 1.65;

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
			grid-column: ${type === 'media' || type === 'camera' ? 'span 2' : 'span 1'};
			grid-row: ${type === 'media' || type === 'camera' ? 'span 4' : 'span 1'};
			display: ${type ? '' : 'none'};
    `;
	}

</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{view?.name}</h1>

		<main
			style:transition="opacity {$motion}ms ease, outline-color {$motion}ms ease"
			style:opacity={'1'}
		>
			{#each view?.sections as section (section?.id)}
				<section
					id={String(section?.id)}
					animate:flip={{ duration: $motion }}
				>
					<!-- horizontal stack -->
					{#if section?.type === 'horizontal-stack'}
						<HorizontalStackHeader {view} {section} />

						<div
							class="horizontal-stack"
							style:min-height="{stackHeight}px"
							style:outline="2px dashed transparent"
							style:transition="min-height {$motion}ms ease, outline {$motion / 2}ms ease"
						>
							{#each section?.sections as stackSection (stackSection.id)}
								{@const empty = $editMode && !stackSection?.items?.length}
								<section
									id={String(stackSection.id)}
									animate:flip={{ duration: $motion }}
									style:overflow="hidden"
								>
									<SectionHeader {view} section={stackSection} />
									<div
										class="items"
										style={sectionStyles($itemHeight, $editMode, $motion, empty)}
									>
										<!-- item -->
										{#each stackSection?.items as item (item.id)}
											<div
												id={item?.id}
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
						>
							{#each section?.items as item (item.id)}
								<div
									id={item?.id}
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

		<ConfigButtons />
	</Modal>
{/if}

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
</style>
