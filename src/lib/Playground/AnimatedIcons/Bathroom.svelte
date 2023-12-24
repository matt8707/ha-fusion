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
			d="M12.9 1.2h2.5c1.6 0 2.9 1.3 2.9 2.9v18.6c0 1.4 1.1 2.5 2.4 2.5h20.5c.5 0 1 .4.9 1-.1 2.6-1.2 9.6-10.2 11v7.6c0 .2.2.4.4.4h1.5a1.58 1.58 0 0 1 1.6 1.6v.3a1.58 1.58 0 0 1-1.6 1.6H11a1.58 1.58 0 0 1-1.6-1.6v-.3a1.58 1.58 0 0 1 1.6-1.6h1.6c.2 0 .4-.2.4-.4v-7.6s-5.2-.3-5.2-5.9V4.2c0-1.6 1.3-2.9 2.9-2.9l2.2-.1c0 .1 0 0 0 0z"
		/>
		<path
			class:on={state_on && timeout < 2000}
			class:off={!state_on && timeout < 2000}
			class:on_timeout={state_on && timeout > 2000}
			d="M22.3 18.8h18.3a1.58 1.58 0 0 1 1.6 1.6v.6a1.58 1.58 0 0 1-1.6 1.6h-19c-.4 0-.7-.3-.8-.7v-2.3c0-.4.3-.7.7-.8h.8z"
		/>
	</svg>
{/if}

<style>
	.on {
		animation: on 0.45s;
		animation-fill-mode: forwards;
		transform-origin: 45% 41%;
		transition-timing-function: cubic-bezier(0.85, 0, 0.15, 1);
	}

	.off {
		animation: off 1.1s linear;
		animation-delay: 0.05s;
		animation-fill-mode: both;
		transform-origin: 45% 41%;
	}

	.on_timeout {
		transform: rotateZ(-90deg) translate(-1.5%, 0%);
		transform-origin: 45% 41%;
	}

	@keyframes on {
		0% {
			transform: rotateZ(0deg) translate(0%, 0%);
		}
		100% {
			transform: rotateZ(-90deg) translate(-1.5%, 0%);
		}
	}

	@keyframes off {
		0% {
			transform: rotateZ(-90deg) translate(-1.5%, 0%);
		}
		45% {
			transform: rotateZ(-40deg);
		}
		55% {
			transform: rotateZ(0deg);
		}
		65% {
			transform: rotateZ(-15deg);
		}
		75% {
			transform: rotateZ(0deg);
		}
		85% {
			transform: rotateZ(-5deg);
		}
		95% {
			transform: rotateZ(0deg);
		}
	}
</style>
