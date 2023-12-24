<script lang="ts">
	import { motion } from '$lib/Stores';
	import { scale } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';

	export let condition: any;

	$: padding = condition ? '0.9em 2.5rem 0.9em 0.9em' : '0.9em';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('clear');
	}
</script>

<div class="clear">
	<slot {padding} />

	{#if condition}
		<button tabindex="-1" transition:scale={{ duration: $motion }} on:click={handleClick}>
			<Icon icon="mingcute:close-fill" height="auto" width="100%" />
		</button>
	{/if}
</div>

<style>
	div {
		display: grid;
	}

	button {
		display: flex;
		align-items: center;
		padding: 0.8rem;
	}
</style>
