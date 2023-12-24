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
			style="clip-path: url(#mask);"
			fill="#9da0a2"
			d="M40.5.8H17.1c-.1 0-.1 0-.1.1A3.12 3.12 0 0 0 20.1 4h6.1c.1 0 .1 0 .1.1v7.4L18 19.1l3.6 3.5 9.1-8.6c.4-.4.6-1 .7-1.6V4c0-.1 0-.1.1-.1h6c1.7.1 3.1-1.3 3-3.1z"
		/>
		<defs>
			<clipPath id="mask">
				<path
					class:on={state_on && timeout < 2000}
					class:off={!state_on && timeout < 2000}
					class:on_timeout={state_on && timeout > 2000}
					d="M0 9.1h24l8.3 8.8H50V-9H0z"
				/>
			</clipPath>
		</defs>
		<path
			fill="white"
			class:on={state_on && timeout < 2000}
			class:off={!state_on && timeout < 2000}
			class:on_timeout={state_on && timeout > 2000}
			d="M25.5 46.4s1.4.5 10.4-8.2c.5-.4 6.3-6.3 5.8-7.1-.7-.8-18.6-19.5-18.6-19.5s-.6-.9-8.6 6.4c-.6.5-8.7 8-7.7 9.1l18.7 19.3z"
		/>
	</svg>
{/if}

<style>
	.on {
		animation: on 0.7s;
		transform-origin: 40% 20%;
		animation-fill-mode: forwards;
		animation-delay: -0.1s;
	}

	.off {
		animation: off 0.7s;
		transform-origin: 40% 20%;
		animation-fill-mode: forwards;
	}

	.on_timeout {
		transform: rotateZ(-15deg);
		transform-origin: 40% 20%;
	}

	@keyframes on {
		0% {
			transform: rotateZ(0deg);
			animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
		}
		70% {
			transform: rotateZ(-15deg);
			animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		}
		75% {
			transform: rotateZ(-15deg);
			animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		}
		88% {
			transform: rotateZ(-11deg);
		}
		100% {
			transform: rotateZ(-15deg);
		}
	}

	@keyframes off {
		0% {
			transform: rotateZ(-15deg);
			animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
		}
		70% {
			transform: rotateZ(0deg);
			animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		}
		75% {
			transform: rotateZ(0deg);
			animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		}
		88% {
			transform: rotateZ(-4deg);
		}
		100% {
			transform: rotateZ(0deg);
		}
	}
</style>
