<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import { onMount } from 'svelte';
	import Ripple from 'svelte-ripple';
	import Modal from '$lib/Modal/Index.svelte';

	export let confirm: any;
	export let cancel: any;
	export let title: string;
	export let message: string;
	export let isOpen: boolean;

	let cancelButton: HTMLButtonElement;

	onMount(() => {
		if (cancelButton) cancelButton.focus();
	});
</script>

{#if isOpen}
	<Modal backdropImage={false}>
		<h1 slot="title">{title}</h1>

		<p>{message}</p>

		<div class="bottom-buttons">
			<button
				on:click={confirm}
				style:background-color="#ae2e2e"
				use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
			>
				{$lang('ok')}
			</button>

			<button bind:this={cancelButton} on:click={cancel} use:Ripple={$ripple}>
				{$lang('cancel')}
			</button>
		</div>
	</Modal>
{/if}

<style>
	.bottom-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 0.4rem;
	}

	.bottom-buttons button {
		border-radius: 0.4em;
		background-color: rgba(255, 255, 255, 0.15);
		border: none;
		color: white;
		padding: 0.55em 0.9em;
		cursor: pointer;
		font-family: inherit;
		margin-top: 0.7rem;
		font-size: 0.9rem;
	}
</style>
