<script lang="ts">
	import { editMode, lang, motion } from '$lib/Stores';
	import { slide } from 'svelte/transition';
	import DragIndicator from '$lib/Main/DragIndicator.svelte';
	import DeleteButton from '$lib/Main/DeleteButton.svelte';
	import VisibilitySectionButton from '$lib/Main/VisibilitySectionButton.svelte';

	export let view: any;
	export let section: any;
</script>

{#if $editMode}
	<header transition:slide={{ duration: $motion }}>
		<span class="title">
			{$lang('horizontal_stack')}
		</span>

		<!-- can't be asynchronously loaded, it'll flash on dnd -->
		<span class="right">
			<DragIndicator />

			<VisibilitySectionButton {section} />

			<DeleteButton {view} {section} />
		</span>
	</header>
{/if}

<style>
	header {
		height: 2.6rem;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.title {
		color: #ffc008;
		font-size: 1.14rem;
		font-weight: 700;
		align-self: center;
	}

	.right {
		display: flex;
	}
</style>
