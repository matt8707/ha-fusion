<script lang="ts">
	import { record, lang } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import type { EmptyItem } from '$lib/Types';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Empty from '$lib/Main/Empty.svelte';

	export let isOpen: boolean;
	export let sel: EmptyItem;

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('empty')}</h1>
		<h2>{$lang('preview')}</h2>

		<div style:pointer-events="none">
			<Empty {sel} />
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
</style>
