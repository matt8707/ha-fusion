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
		<path
			fill="#9da0a2"
			d="M26.5 21.8l3.8-6.1H19.7l3.8 6.1c-5 .7-6.3 5.8-5.7 10.2.7 5.1 3.2 10.1 5.7 14.4H19v2.5h11.8v-2.5h-4.5C29 42 31.4 37 32.1 32c.6-4.4-.6-9.4-5.6-10.2zm3.1 9.1c-.3 4.3-2.3 8.7-4.4 12.4l-.2.1v.1-.1c-1.8-3-3.3-6.4-4.1-9.7-.7-3.1-1-7.2 2.7-8.4 1.4-.5 3.1-.1 4.2.8 1.6 1 1.8 3 1.8 4.8z"
		/>
		<path
			class:on={state_on && timeout < 2000}
			fill="white"
			d="M38.1 20L35.7 3.8c-.3-1.9-.4-1.7-.6-2-.9-.6-2.3-.7-2.3-.7H17.4s-1.4 0-2.3.7c-.2.3-.3.1-.6 2C14 5.7 11.9 20 11.9 20s5.8.3 13.4.3h0c7.3 0 12.8-.3 12.8-.3z"
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
	}
</style>
