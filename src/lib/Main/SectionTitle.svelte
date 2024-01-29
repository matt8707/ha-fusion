<script lang="ts">
	import { editMode, lang, record } from '$lib/Stores';
	import { createEventDispatcher } from 'svelte';

	export let value: string;

	let width: number;
	let input: HTMLInputElement;

	const dispatch = createEventDispatcher();

	/**
	 * Dispatches title change on submit or blur,
	 * also restores required title if empty
	 */
	function handleSubmit() {
		if (!$editMode) return;

		dispatch('submit', value);
		$record();

		if (input) input.blur();
	}

	/**
	 * Stops the propagation of the 'f' keydown event,
	 * because `$drawerSearch` hijacks that key event.
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'f') {
			event.stopPropagation();
		}
	}
</script>

<!-- reference width -->
<div class="hidden" bind:offsetWidth={width}>
	{#if value === ''}
		{$lang('section')}
	{:else}
		{@html value.replaceAll(' ', '&nbsp;')}
	{/if}
</div>

<form on:submit|preventDefault={handleSubmit}>
	<input
		class="input"
		name={value}
		bind:value
		bind:this={input}
		on:blur={handleSubmit}
		on:keydown={handleKeydown}
		style:width="{width + 1}px"
		autocomplete="off"
		spellcheck="false"
		placeholder={$lang('section')}
	/>
</form>

<style>
	.hidden {
		position: absolute;
		height: 0;
		pointer-events: none;
		visibility: hidden;
	}

	.input {
		border: none;
		background: none;
		font-size: inherit;
		color: inherit;
		font-weight: inherit;
		text-align: inherit;
		box-shadow: none;
		font-family: inherit;
		margin: 0;
		padding: 0;
		outline: none;
		cursor: unset;
	}
</style>
