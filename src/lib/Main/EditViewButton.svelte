<script lang="ts">
	import { motion, lang, ripple } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { createEventDispatcher } from 'svelte';

	export let view: any;

	const dispatch = createEventDispatcher();

	let clientWidth = 0;

	$: dispatch('change', clientWidth);

	/**
	 * Opens modal to edit view
	 */
	function handleClick() {
		if (view) {
			openModal(() => import('$lib/Modal/ViewConfig.svelte'), {
				sel: view
			});
		}
	}
</script>

<button
	bind:clientWidth
	class="edit"
	on:click={handleClick}
	transition:fade={{ duration: $motion / 2 }}
	use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
>
	{$lang('edit_view')}
</button>

<style>
	.edit {
		background: #ffc008;
		color: #3b0f0f;
		padding: 0.4rem 0.7rem;
		font-weight: 500;
		float: right;
		font-size: 0.8rem;
		cursor: pointer;
		height: 1.8rem;
		align-items: center;
		border: inherit;
		border-radius: 0.4rem;
		display: flex;
		font-family: inherit;
		white-space: nowrap;
		margin-top: 0.25rem;
	}
</style>
