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
	{#if state_on && timeout < 2000}
		<svg viewBox="0 0 50 50">
			<g style="clip-path: url(#mask);">
				<g class="on">
					<path fill="#00aa9e" d="M49.2 38.9l-75.6-25.1v7.4l75.6 25.2z" />
					<path fill="#f3c202" d="M49.2 46.4l-75.6-25.2v7.5l75.6 25.1z" />
					<path
						fill="#326db3"
						d="M49.2 53.8l-75.6-25.1V51l75.6 25.1zm0-22.3L-26.4 6.4v7.4l75.6 25.1z"
					/>
				</g>
			</g>
			<defs>
				<clipPath id="mask">
					<path
						d="M47.5 33.2c-.5-2.2-3.9-3.5-9.1-3.9-3.8-.3-7.5.6-11.1 1.9l-.6.2v-5.7l-5.7.8-4.6 1.6L6 31.9h-.1c-1.9.7-3.8 2.2-3.7 4.2.1 2.1 4.7 2.6 8.2 3.2 3.3.6 6.2.2 8.9-.7l7.3 4.8L33 41l10.7-4h.1c2.8-1 4-2.5 3.7-3.8zm-31.3 2l-3.6 1.3c-2.2.8-4.1-1.1-2.1-1.9l1.7-.6 7.2-2.7v2.8l-3.2 1.1zm22.5-1.1l-1.9.7-10.2 3.7V36l6.5-2.4 3.8-1.3c4-.9 5.6.5 1.8 1.8z"
					/>
				</clipPath>
			</defs>
			<path
				fill="#de0029"
				d="M26.7 14.6v28.7l-7.3-2.5V7.1l9.3 2.6c6 1.7 9.6 5 9.6 10.7-.1 6.7-3 9.4-8.7 7.6V14.9c-.1-1.6-2.9-1.7-2.9-.3h0z"
			/>
		</svg>
	{:else if state_on && timeout > 2000}
		<svg viewBox="0 0 50 50">
			<path
				d="M33.1 33.6L26.7 36v-4.5l6.4 2.1h0zM19.4 29l-2.9-1h-.1L6 31.9h-.1-.1l6.3 2.1h.1l7.2-2.7V29zm0 5.1l-3.2 1.1-.3.1 3.5 1.2v-2.4zm17.4.7h0l-10.1 3.7v.4L33 41l10.6-4-6.8-2.2z"
				fill="#00aa9e"
			/>
			<path
				d="M19.4 38.5l-.1.1c-2.7.9-5.6 1.3-8.9.7-3.5-.6-8.1-1.1-8.2-3.2-.1-2 1.7-3.4 3.6-4.2l6.3 2.1-1.6.6c-2 .8-.1 2.7 2.1 1.9l3.3-1.2 3.5 1.2v2zm7.3 4.8L33 41l-6.3-2.1v4.4"
				fill="#f3c202"
			/>
			<path
				d="M19.4 29l-2.9-1 2.9-1v2zm28.1 4.2c-.5-2.2-3.9-3.5-9.1-3.9-3.8-.3-7.5.6-11.1 1.9l-.6.2h0l6.5 2.1 3.7-1.3c4-.9 5.6.5 1.8 1.8l-1.9.7 6.8 2.2h.1.1c2.8-.9 4-2.4 3.7-3.7z"
				fill="#326db3"
			/>
			<path
				d="M26.7 14.6v28.7l-7.3-2.5V7.1l9.3 2.6c6 1.7 9.6 5 9.6 10.7-.1 6.7-3 9.4-8.7 7.6V14.9c-.1-1.6-2.9-1.7-2.9-.3z"
				fill="#de0029"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 50 50">
			<path
				fill="white"
				d="M43.8 37h-.1l-10.6 4-4.2 1.6v-4.9l8-2.9 1.9-.7c3.8-1.3 2.2-2.7-1.8-1.9l-3.8 1.3-4.3 1.6v-4.5c3.1-1 6.3-1.6 9.5-1.4 5.3.4 8.7 1.6 9.1 3.9.3 1.4-.9 2.9-3.7 3.9zm-26.7-2.1l-.9.3-3.6 1.3c-2.2.8-4.1-1.1-2.1-1.9l1.7-.6 5-1.9v-4.2l-.6.2L6 31.9h-.1c-1.9.7-3.8 2.2-3.7 4.2.1 2.1 4.7 2.6 8.2 3.2 2.4.4 4.6.3 6.7-.1v-4.3zm12.4-20V28c5.7 1.7 8.7-.9 8.7-7.6.1-5.7-3.6-9-9.6-10.7l-9.3-2.6v33.8l7.2 2.5.1.1V14.6c.1-1.4 2.9-1.3 2.9.3z"
			/>
		</svg>
	{/if}
{/if}

<style>
	.on {
		animation: on 2s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
	}

	@keyframes on {
		50% {
			transform: translateY(-45%);
		}
		100% {
			transform: translateY(0);
		}
	}
</style>
