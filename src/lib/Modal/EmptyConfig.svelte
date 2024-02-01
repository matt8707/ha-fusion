<script lang="ts">
	import { lang } from '$lib/Stores';
	import type { EmptyItem } from '$lib/Types';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
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

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	div {
		pointer-events: none;
	}
</style>
