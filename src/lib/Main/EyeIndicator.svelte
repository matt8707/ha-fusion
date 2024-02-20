<script lang="ts">
	import { motion } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import { openModal } from 'svelte-modals';
	import Icon from '@iconify/svelte';

	export let eyeWidth: number;

	/**
	 * Opens modal and highlights `hide_views`
	 */
	function handleIconClick() {
		openModal(() => import('$lib/Modal/AppearanceConfig.svelte'), {
			highlight: true
		});
	}
</script>

<button
	class="edit eye"
	on:click={handleIconClick}
	transition:fade={{ duration: $motion }}
	bind:offsetWidth={eyeWidth}
>
	<Icon icon="charm:eye-slash" height="none" />
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

	.eye {
		width: 2.2rem;
		background-color: transparent;
		color: white;
		padding: 0;
		padding-right: 0.4rem;
	}
</style>
