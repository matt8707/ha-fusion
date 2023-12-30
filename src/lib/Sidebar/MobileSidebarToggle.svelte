<script lang="ts">
	import { showDrawer, motion } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import { scale } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let mobileSidebar: boolean;

	function handleClick() {
		dispatch('toggle');
	}
</script>

{#if !$showDrawer}
	<div transition:scale={{ duration: $motion / 2 }}>
		<button on:click={handleClick}>
			<figure
				style:transform={mobileSidebar ? 'scaleX(1)' : 'scaleX(-1)'}
				style:transition="transform {$motion}ms ease"
			>
				<Icon icon="solar:sidebar-minimalistic-bold-duotone" height="none" />
			</figure>
		</button>
	</div>
{/if}

<style>
	div {
		position: absolute;
		top: 1.6rem;
		right: 5.5rem;
	}

	button {
		all: unset;
	}

	figure {
		width: 1.5em;
		margin: 0 0.2rem 0 0;
		vertical-align: middle;
		display: inline-block;
		color: inherit;
		cursor: pointer;
	}
</style>
