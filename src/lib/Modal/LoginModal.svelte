<script lang="ts">
	import { configuration, lang, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { Auth } from 'home-assistant-js-websocket';
	import { closeModal } from 'svelte-modals';
	import { onMount } from 'svelte';
	import Loader from '$lib/Components/Loader.svelte';
	import { webSocket } from '$lib/Socket';
	import { base } from '$app/paths';

	export let isOpen: boolean;
	export let clientId: string | undefined;
	export let flow_id: string | undefined;

	let invalidAuth: string;
	let disabled = false;
	let focusElement: HTMLInputElement;

	let username = '';
	let password = '';

	async function handleSubmit() {
		if (!flow_id) return;
		disabled = true;

		try {
			const response = await fetch(`${base}/api/auth/${flow_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password, clientId })
			});

			const data = await response.json();

			// success
			if (data?.access_token) {
				data.clientId = clientId;
				data.hassUrl = $configuration?.hassUrl;
				data.expires = data.expires_in * 1000 + Date.now();

				const auth = new Auth({ ...data, hassUrl: $configuration?.hassUrl, clientId });

				localStorage.setItem('auth', JSON.stringify(data));

				await webSocket(auth);

				disabled = false;
				closeModal();
			} else {
				if (data?.error?.errors?.base === 'invalid_auth') {
					invalidAuth = $lang('login_error')?.replace('{error}', $lang('invalid_auth'));

					disabled = false;
				} else {
					console.error('authentication failed:', data);
				}
			}
		} catch (error) {
			console.error('authentication error:', error);
		}
	}

	onMount(() => {
		if (focusElement) {
			focusElement.focus();
		}
	});
</script>

{#if isOpen}
	<Modal backdropImage={false}>
		<h1 slot="title">{$lang('login')}</h1>

		{#if disabled}
			<Loader />
		{/if}

		<div style:opacity={disabled ? '0.5' : '1'} style:transition="opacity {$motion}ms ease">
			<span
				style:background-color={invalidAuth ? 'rgba(255, 0, 0, 0.34)' : 'rgba(255, 255, 255, 0.1)'}
				style:transition="background-color {$motion}ms ease"
			>
				{#if invalidAuth}
					{invalidAuth}
				{:else}
					{$lang('authorizing_client').replace('{clientId}', '"Fusion"')}
				{/if}
			</span>

			<form on:submit|preventDefault={handleSubmit}>
				<h2>{$lang('username')}</h2>
				<input
					bind:this={focusElement}
					bind:value={username}
					class="input"
					placeholder={$lang('username')}
				/>

				<h2>{$lang('password')}</h2>
				<input
					type="password"
					bind:value={password}
					class="input"
					placeholder={$lang('password')}
				/>

				<button class="done action" type="submit" {disabled}>
					{$lang('login')}
				</button>
			</form>
		</div>
	</Modal>
{/if}

<style>
	button {
		margin-top: 2rem;
		background-color: rgb(255, 255, 255, 0.1) !important;
	}

	span {
		display: block;
		margin-top: 1rem;
		border-radius: 0.6rem;
		padding: 1.2rem;
	}
</style>
