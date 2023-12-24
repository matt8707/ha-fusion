<script lang="ts">
	import { editMode, record } from '$lib/Stores';
	import { onMount, createEventDispatcher } from 'svelte';

	export let value: string;

	let width: number;
	let prevValue: string;
	let input: HTMLInputElement;

	const dispatch = createEventDispatcher();

	onMount(() => {
		prevValue = value;
	});

	/**
	 * Dispatches title change on submit or blur,
	 * also restores required title if empty
	 */
	function handleSubmit() {
		if (!$editMode) return;

		if (value === '') {
			value = prevValue;
		}

		dispatch('submit', value);
		$record();

		prevValue = value;
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
	{@html value.replaceAll(' ', '&nbsp;')}
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
		required={true}
		autocomplete="off"
		spellcheck="false"
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
