<script lang="ts">
	import { motion } from '$lib/Stores';
	import { createEventDispatcher } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let value: number;
	export let min: number;
	export let max: number;
	export let step: number | undefined = undefined;

	const dispatch = createEventDispatcher();

	// value in range 0 to 1
	$: normalized = (value - min) / (max - min);

	const fill = tweened(normalized, {
		duration: $motion,
		easing: cubicOut
	});

	$: fill.set(normalized);

	/**
	 * Dispatches value on input end
	 */
	function handleChange(event: { currentTarget: HTMLInputElement }) {
		const value = event.currentTarget.value;
		dispatch('change', value);
	}
</script>

<div>
	<span style:width="{$fill * 100}%"></span>
	<input
		name="slider"
		type="range"
		{step}
		{min}
		{max}
		bind:value
		on:input={() => {
			dispatch('input', value);
		}}
		on:change={handleChange}
	/>
</div>

<style>
	:root {
		--slider-height: 3rem;
	}

	div {
		position: relative;
		height: var(--slider-height);
		border-radius: 0.8rem;
		overflow: hidden;
	}

	span {
		border-top: var(--slider-height) solid white;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	input[type='range'] {
		appearance: none;
		background-color: rgba(0, 0, 0, 0.5);
		margin: 0;
		width: 100%;
		height: 100%;
	}

	input[type='range']::-webkit-slider-thumb {
		width: 0;
		appearance: none;
	}

	input[type='range']::-moz-range-thumb {
		width: 0;
		appearance: none;
		border: none;
		background: transparent;
	}
</style>
