<script lang="ts">
	import { record, lang } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import type { PlaceholderItem } from '$lib/Types';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Placeholder from '$lib/Main/Placeholder.svelte';

	export let isOpen: boolean;
	export let sel: PlaceholderItem;

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('placeholder')}</h1>
		<h2>{$lang('preview')}</h2>

		<div style:pointer-events="none">
			<Placeholder {sel} />
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
</style>
