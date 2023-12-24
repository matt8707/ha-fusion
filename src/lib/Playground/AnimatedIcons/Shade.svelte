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
	<svg viewBox="0 0 50 50" fill="white">
		<path
			fill="#9da0a2"
			d="M26.4 25.6c.6-.3 1.1-.7 1.1-1.3L25 17.9l-2.5 6.4c0 .7.6 1.1 1.1 1.3v20.8h-5.5v2.7h13.7v-2.7h-5.5V25.6z"
		/>
		<path
			class:on={state_on && timeout < 2000}
			fill="white"
			d="M24.6.9l-9.4.5c-.6.1-1.9 0-2.5 2.1s-2.4 9.1-4 16.9c-.2.7-.5 2-.5 2.3s-.4 1.6.9 1.6c.8.1 7.4.3 15.9.3 8.6 0 15.1-.3 15.9-.3 1.3-.1.9-1.3.9-1.6s-.3-1.6-.5-2.3c-1.6-7.8-3.4-14.8-4-16.9s-1.9-2-2.5-2.1c-1.6-.2-6.9-.4-9.4-.5"
		/>
	</svg>
{/if}

<style>
	.on {
		animation: on 0.8s;
		transform-origin: center;
	}

	@keyframes on {
		0% {
			transform: scale(0.85);
		}
		20% {
			transform: scale(1.1);
		}
		40% {
			transform: scale(0.95);
		}
		60% {
			transform: scale(1.03);
		}
		80% {
			transform: scale(0.97);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
