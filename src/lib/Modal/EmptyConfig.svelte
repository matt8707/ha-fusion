<script lang="ts">
	import { lang } from '$lib/Stores';
	import type { EmptyItem } from '$lib/Types';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import VisibilityItemButton from '$lib/Main/VisibilityItemButton.svelte';
	import Empty from '$lib/Main/Empty.svelte';

	export let isOpen: boolean;
	export let sel: EmptyItem;
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('empty')}</h1>
		<h2>{$lang('preview')}</h2>

		<div>
			<Empty {sel} />
		</div>

		<h2>{$lang('visibility')}</h2>

		<div style="display: flex; gap: 0.8rem;">
			<VisibilityItemButton item={sel} />
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	div {
		pointer-events: none;
	}
</style>
