<script lang="ts">
	import { configuration, lang, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { base } from '$app/paths';
	import { closeModal } from 'svelte-modals';

	export let isOpen: boolean;

	let token = '';

	async function handleClick() {
		if (!token) return;

		$configuration.token = token;

		try {
			const response = await fetch(`${base}/_api/save_config`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($configuration)
			});

			if (response.ok) {
				// ok
				closeModal();
			} else {
				console.error('Failed to save configuration.', response);
			}
		} catch (error) {
			console.error('Failed to save configuration.', error);
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('login')}</h1>

		<div data-exclude-drag-modal>
			<p>
				A <b>long-lived access token</b> is required for authentication when using both Ingress and the
				Home Assistant Companion app simultaneously.
			</p>
			<p>
				Open your user profile, <a
					href="{$configuration?.hassUrl}/profile/security"
					target="_blank"
				>
					{$configuration?.hassUrl}/profile/security
				</a>
				to create and copy a new <b>long-lived access token</b>.
			</p>
		</div>

		<form on:submit|preventDefault={handleClick}>
			<h2>{$lang('token')}</h2>

			<input class="input" type="password" bind:value={token} />

			<button
				style:transition="opacity {$motion}ms ease"
				class="done action"
				type="submit"
				disabled={token === ''}
			>
				{$lang('save')}
			</button>
		</form>
	</Modal>
{/if}

<style>
	div {
		display: block;
		margin-top: 1rem;
		border-radius: 0.6rem;
		padding: 0.1rem 1.2rem 0.3rem 1.2rem;
		background-color: rgba(255, 255, 255, 0.1);
		user-select: text;
	}

	a {
		color: #00dbff;
	}

	button {
		opacity: 1;
		margin-top: 2rem;
		background-color: rgb(255, 255, 255, 0.1) !important;
		font-weight: 400;
	}

	button:disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
