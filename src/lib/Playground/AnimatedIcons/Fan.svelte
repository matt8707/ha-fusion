<script lang="ts">
	import { onStates } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let stateObj: HassEntity;
	export let handleClick: (entity_id: string) => void;

	$: entity_id = stateObj?.entity_id;
	$: state = stateObj?.state;
	$: timeout = Date.now() - Date.parse(stateObj?.last_changed);
	$: state_on = $onStates.includes(state);

	const path = `
		<circle cx="25" cy="25" r="6.6"/>
		<path d="M31.9 30.4c-.5.6-1.1 1.1-1.7 1.5-1.4 1.1-3.2 1.7-5.2 1.7-2.3 0-4.5-.9-6-2.4-.9 1.1-1.6
		2.3-2.3 3.2l-4.9 5.4c-1.8 2.7.3 5.6 2.5 7 3.9 2.4 9.8 3.1 14.1 1.9 4.6-1.3 7.9-4.7 7.4-9.7-.2-3.4-1.9-6-3.9-8.6zM17
		28.3c-.4-1-.6-2.1-.6-3.3a8.7 8.7 0 0 1 6.4-8.4l-1.6-3.5L19 6.2c-1.5-2.8-5-2.5-7.3-1.2-4 2.2-7.5 6.9-8.7 11.3-1.2
		4.6.2 9.2 4.7 11.3 3.1 1.3 6.1 1.2 9.3.7zm26.9-17.6c-3.3-3.4-8-4.6-12.1-1.8-2.8 1.8-4.2 4.6-5.5 7.5 4.2.6 7.4 4.2
		7.4 8.6 0 .9-.1 1.7-.4 2.5 1.3.2 2.8.3 3.8.4 2.3.4 4.7 1.3 7.1 1.7 3.2.3 4.7-3 4.8-5.6.3-4.6-1.9-10.1-5.1-13.3z"/>
	`;
</script>

<input type="text" bind:value={entity_id} />
<button on:click={() => handleClick(entity_id)}> toggle </button>
<br />
{state}
<br />
<br />

{#if state && timeout}
	<svg viewBox="0 0 50 50" fill="white">
		{#if state_on && timeout < 2000}
			<g class="start">
				{@html path}
			</g>
			<g class="on">
				{@html path}
			</g>
		{:else if !state_on && timeout < 2000}
			<g class="end">
				{@html path}
			</g>
		{:else if state_on && timeout > 2000}
			<g class="start_timeout">
				{@html path}
			</g>
		{:else}>
			{@html path}
		{/if}
	</svg>
{/if}

<style>
	@keyframes rotate {
		0% {
			visibility: visible;
			transform: rotate(0deg) translateZ(0);
		}
		100% {
			transform: rotate(1080deg) translateZ(0);
		}
	}

	.start {
		animation: rotate 2.8s ease-in;
		transform-origin: center;
		visibility: hidden;
		will-change: transform;
	}

	.on {
		animation: rotate 1.8s linear infinite;
		transform-origin: center;
		animation-delay: 2.8s;
		visibility: hidden;
		will-change: transform;
	}

	.end {
		animation: rotate 2.8s;
		transform-origin: center;
		animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
		will-change: transform;
	}

	.start_timeout {
		animation: rotate 1.8s linear infinite;
		transform-origin: center;

		visibility: hidden;
		will-change: transform;
	}
</style>
