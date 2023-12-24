<script lang="ts">
	import { onStates } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';

	export let stateObj: HassEntity;
	export let handleClick: (entity_id: string) => void;

	$: entity_id = stateObj?.entity_id;
	$: state = stateObj?.state;
	$: timeout = Date.now() - Date.parse(stateObj?.last_changed);
	$: state_on = $onStates.includes(state);

	const path =
		'<path fill="white" d="M46 9.2v27.5H4.1V9.2H46m2.4-2.4H1.6v32.3h46.7c.1 0 .1-32.3.1-32.3zM11.9 43.2h26.3c.6 0 1.1-.4 1.1-1v-.3c0-.6-.4-1.1-1-1.1H11.9c-.6 0-1.1.4-1.1 1v.3a1.11 1.11 0 0 0 1.1 1.1z"/>';

	const d = 'M2.9,8h44.3v29.9H2.9V8z';

	const gradient = `
    <linearGradient id="A" gradientUnits="userSpaceOnUse" x1="5.401" y1="34.714" x2="43.817" y2="11.74">
      <stop offset="0" stop-color="#64acb7"/>
      <stop offset="1" stop-color="#7fdbe9"/>
    </linearGradient>
  `;
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
			{@html gradient}
			<path {d} fill="#20262890" />
			<path class="on" {d} fill="url(#A)" />
		{:else if !state_on && timeout < 2000}
			{@html gradient}
			<path class="off" {d} fill="url(#A)" />
		{:else if state_on && timeout > 2000}
			{@html gradient}
			<path {d} fill="#20262890" />
			<path {d} fill="url(#A)" />
		{/if}
		{@html path}
	</svg>
{/if}

<style>
	.on {
		animation: on 1s;
		transform-origin: -100% 46%;
		animation-fill-mode: forwards;
	}

	.off {
		animation: off 1s;
		transform-origin: -100% 46%;
		animation-fill-mode: forwards;
	}

	@keyframes on {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}

	@keyframes off {
		from {
			transform: scaleY(1);
		}
		to {
			transform: scaleY(0);
		}
	}
</style>
