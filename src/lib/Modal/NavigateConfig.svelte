<script lang="ts">
	import { lang } from '$lib/Stores';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Navigate from '$lib/Sidebar/Navigate.svelte';
	import type { NavigateItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: NavigateItem;

	let modalTransitionEnd = false;
	function handleEvent() {
		modalTransitionEnd = true;
	}
</script>

{#if isOpen}
	<Modal on:transitionend={handleEvent}>
		<h1 slot="title">{$lang('navigate')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Navigate {modalTransitionEnd} />
		</div>

		<p>{$lang('no_options')}</p>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	p {
		color: #ffc008;
		margin-block-start: 0.6rem;
		margin-block-end: 0;
		font-weight: 500;
	}
</style>
