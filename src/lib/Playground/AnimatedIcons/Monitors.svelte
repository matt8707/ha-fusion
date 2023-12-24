<script lang="ts">
	import { onStates } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let stateObj: HassEntity;
	export let handleClick: (entity_id: string) => void;

	$: entity_id = stateObj?.entity_id;
	$: state = stateObj?.state;
	$: timeout = Date.now() - Date.parse(stateObj?.last_changed);
	$: state_on = $onStates.includes(state);
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
		{#if state_on}
			<g class:speaker={timeout < 2000}>
				<path
					fill="#686868"
					d="M35.8 46.9H14.2c-1.1 0-2-1-2-2.3V6.7c0-1.3.9-2.3 2-2.3h21.5c1.1 0 2 1 2 2.3v37.9c0 1.2-.9 2.3-1.9 2.3z"
				/>
				<path
					fill="#2a2a2a"
					d="M39.2 1H10.8C9.4 1 8.3 2.1 8.2 3.5v42.9a2.65 2.65 0 0 0 2.6 2.6h28.3c1.4 0 2.5-1.2 2.6-2.6V3.5c0-1.4-1.1-2.5-2.5-2.5zM25 7c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4-2.4-1.1-2.4-2.4C22.5 8 23.6 7 25 7zm10.2 35.5l-.4 1.9s-.2.6-.6.6H15.8c-.4 0-.6-.6-.6-.6s-.1-1.1-.4-1.9.6-.9.6-.9h19.3c0-.1.8-.1.5.9z"
				/>
			</g>
			<path
				class:cone={timeout < 2000}
				fill="#e5dd00"
				d="M25 15.7c-6.2 0-11.3 5.1-11.3 11.3S18.8 38.3 25 38.3 36.3 33.2 36.3 27c-.1-6.3-5.1-11.3-11.3-11.3zm0 14.5a3.33 3.33 0 0 1-3.3-3.3 3.33 3.33 0 0 1 3.3-3.3 3.33 3.33 0 0 1 3.3 3.3c-.1 1.9-1.5 3.3-3.3 3.3z"
			/>
		{:else}
			<path
				fill="#9da0a2"
				d="M25 18.6c-4.6 0-8.4 3.8-8.4 8.4s3.8 8.4 8.4 8.4 8.4-3.8 8.4-8.4-3.7-8.4-8.4-8.4zm0 11.7a3.33 3.33 0 0 1-3.3-3.3 3.33 3.33 0 0 1 3.3-3.3 3.33 3.33 0 0 1 3.3 3.3c0 1.8-1.4 3.3-3.3 3.3zM39.2 1H10.9C9.4 1 8.3 2.1 8.3 3.6v42.9a2.65 2.65 0 0 0 2.6 2.6h28.3a2.65 2.65 0 0 0 2.6-2.6v-43C41.7 2 40.5.9 39.2 1zM25 7c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4-2.4-1.1-2.4-2.4S23.7 7 25 7zm10.3 35.5l-.4 1.9s-.2.6-.6.6H15.8c-.4 0-.6-.6-.6-.6l-.4-1.9c-.2-.9.6-.9.6-.9h19.3s.9.1.6.9zM25 38.2c-6.2 0-11.3-5.1-11.3-11.3a11.29 11.29 0 1 1 22.6 0c.1 6.3-5 11.3-11.3 11.3z"
			/>
		{/if}
	</svg>
{/if}

<style>
	.speaker {
		animation: speaker 1.3s;
		transform-origin: center;
	}

	.cone {
		animation: cone 1.2s;
		transform-origin: center;
	}

	@keyframes speaker {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1);
		}
		49% {
			transform: scale(0.95);
		}
		63% {
			transform: scale(1);
		}
		77% {
			transform: scale(0.95);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes cone {
		35% {
			transform: scale(0.8);
			animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
		}
		36% {
			transform: translateY(0%);
		}
		49% {
			transform: scale(1.25);
		}
		63% {
			transform: scale(0.85);
			animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
		}
		77% {
			transform: scale(1.15);
			animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
		}
		95% {
			transform: scale(1);
		}
	}
</style>
