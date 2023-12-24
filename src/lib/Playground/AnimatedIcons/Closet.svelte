<script lang="ts">
	import { onStates } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let stateObj: HassEntity;
	export let handleClick: (entity_id: string) => void;

	$: entity_id = stateObj?.entity_id;
	$: state = stateObj?.state;
	$: timeout = Date.now() - Date.parse(stateObj?.last_changed);
	$: state_on = $onStates.includes(state);

	const pathRoom = '<path d="M11.4,1.4h27.2v43.1H11.4V1.4z" fill="#bcbcbc" />';
	const pathDoor =
		'<path d="M11.4 1.4v43.1h27.2V1.4H11.4zm23 23.4c0 1.1-.9 1.9-1.9 1.9h0c-1.1 0-1.9-.9-1.9-1.9V21c0-1.1.9-1.9 1.9-1.9h0c1.1 0 1.9.9 1.9 1.9v3.8z" fill="white" />';
</script>

<input type="text" bind:value={entity_id} />
<button
	on:click={() => {
		handleClick(entity_id);
	}}
>
	toggle
</button>
<br />
{state}
<br />
<br />

{#if state && timeout}
	<svg viewBox="0 0 50 50">
		{#if state_on && timeout < 2000}
			<g class="opacity">
				{@html pathRoom}
			</g>
			<g class="state">
				{@html pathDoor}
			</g>
		{:else if !state_on && timeout < 2000}
			<g class="opacity reverse">
				{@html pathRoom}
			</g>
			<g class="state reverse">
				{@html pathDoor}
			</g>
		{:else if state_on && timeout > 2000}
			{@html pathRoom}
			<g class="state_timeout_on">
				{@html pathDoor}
			</g>
		{:else}
			{@html pathDoor}
		{/if}
	</svg>
{/if}

<style>
	.state {
		animation: state 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
	}

	.opacity {
		animation: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
	}

	.reverse {
		animation-direction: reverse;
	}

	.state_timeout_on {
		transform: skewY(10deg) translate(4.5%, -3.9%) scaleX(0.8);
	}

	@keyframes state {
		0% {
			transform: none;
		}
		100% {
			transform: skewY(10deg) translate(4.5%, -3.9%) scaleX(0.8);
		}
	}
	@keyframes opacity {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
