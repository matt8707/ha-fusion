<script lang="ts">
	import { editMode, motion } from '$lib/Stores';
	import DragIndicator from '$lib/Main/DragIndicator.svelte';
	import DeleteButton from '$lib/Main/DeleteButton.svelte';
	import VisibilitySectionButton from '$lib/Main/VisibilitySectionButton.svelte';
	import VisibilityItemTemplateButton from '$lib/Main/VisibilityItemTemplateButton.svelte';
	import SectionTitle from '$lib/Main/SectionTitle.svelte';
	import { slide } from 'svelte/transition';

	export let view: any;
	export let section: any;
</script>

{#if section?.name !== '' || $editMode}
	<header transition:slide={{ duration: $motion }}>
		<h1 style:cursor={$editMode ? 'text' : 'initial'}>
			{#if $editMode}
				<SectionTitle bind:value={section.name} />
			{:else if section?.name === ''}
				{@html '&nbsp;'}
			{:else}
				{section?.name}
			{/if}
		</h1>

		{#if $editMode}
			<div class="right">
				<DragIndicator />

				<VisibilityItemTemplateButton {section} />

				<VisibilitySectionButton {section} />

				<!-- can't be asynchronously loaded, it'll flash on dnd -->
				<DeleteButton {view} {section} />
			</div>
		{/if}
	</header>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--theme-colors-title);
	}

	header h1 {
		padding: 0;
		font-size: 1.8rem;
		font-weight: 600;
		margin-block-start: 0;
		margin-block-end: 0.4rem;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		header h1 {
			font-size: 1.7rem;
		}
	}

	.right {
		display: flex;
	}
</style>
