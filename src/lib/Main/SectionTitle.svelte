<script lang="ts">
	import { editMode, record, lang } from '$lib/Stores';
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
		placeholder={$lang('section_name')}
		name={value}
		bind:value
		bind:this={input}
		on:blur={handleSubmit}
		on:keydown={handleKeydown}
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
		border: 0;
		background: none;
		font-size: inherit;
		color: inherit;
		font-weight: inherit;
		text-align: inherit;
		box-shadow: none;
		font-family: inherit;
		min-width: 100%;
		margin: 10px;
		padding: 10px;
		outline: rgb(255, 192, 8) dashed 2px;
		border-radius: 0.65rem;
		cursor: unset;
	}
</style>
