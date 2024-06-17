<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { closeModal } from 'svelte-modals';
	import { lang, motion, ripple, youtubeAddon } from '$lib/Stores';
	import { slide } from 'svelte/transition';
	import Ripple from 'svelte-ripple';
	import type { YouTubeEvent } from '$lib/Types';

	export let isOpen: boolean;

	let interval: ReturnType<typeof setInterval>;
	let controller: AbortController;
	let event: YouTubeEvent | undefined;
	let data: any;
	let copied = false;
	let inputCode: HTMLInputElement;

	/**
	 * If no credentials are saved, it starts the auth flow
	 * otherwise returns the user account.
	 */
	async function initialize() {
		controller = new AbortController();

		try {
			const response = await fetch(`${base}/_api/youtube`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				signal: controller?.signal
			});

			const result = await response.json();
			data = result;

			if (!response.ok) {
				throw new Error(result?.message);
			}

			clearInterval(interval);
		} catch (err: any) {
			if (err?.name === 'AbortError') {
				// ignore
			} else {
				event = { message: 'error', error: err?.message };
				console.error(err);
			}
			clearInterval(interval);
		}
	}

	/**
	 * Polls for events, specifically 'auth-pending'.
	 * Server-Sent Events (SSE) do not work with ingress...
	 */
	async function pollEvents() {
		const start = new Date().getTime();
		let attempts = 0;

		interval = setInterval(async () => {
			// console.debug('polling...');

			try {
				const response = await fetch(`${base}/_api/youtube`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						message: 'poll'
					})
				});
				const result = await response.json();

				attempts++;

				// make sure data is not stale
				if (!result?.timestamp || result.timestamp > start) {
					event = result;
				}

				if (result?.message === 'auth' || result?.message === 'auth-error') {
					clearInterval(interval);
				}

				// stop polling after 5 attempts if no data is received
				if (attempts >= 5 && !event) {
					event = { message: 'error', error: 'No valid response in 5 attempts' };
					clearInterval(interval);
				}
			} catch (err) {
				event = { message: 'error', error: 'Polling failed' };
				console.error('Polling error:', err);
				clearInterval(interval);
			}
		}, 1000);
	}

	/**
	 * Signs out the user by sending a logout request to the server.
	 * Deactivates the add-on and closes the modal.
	 */
	async function signOut() {
		try {
			const response = await fetch(`${base}/_api/youtube`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: 'logout'
				})
			});

			const result = await response.json();
			if (result?.message === 'success') {
				$youtubeAddon = false;
				closeModal();
			} else {
				console.error(result);
			}
		} catch (err) {
			console.error('Failed to sign out:', err);
		}
	}

	/**
	 * Copies a given user code to the clipboard.
	 * Doesn't work with ingress, have to manually copy.
	 */
	async function copyCode(user_code: string | undefined) {
		if (!user_code) return;

		try {
			inputCode?.select();

			await navigator.clipboard.writeText(user_code);
			copied = true;
			setTimeout(() => (copied = false), $motion * 2);
		} catch (err: any) {
			console.error(err?.message);
			copied = false;
		}
	}

	onMount(() => {
		initialize();
		pollEvents();
	});

	onDestroy(() => {
		clearInterval(interval);
		controller?.abort?.();
	});
</script>

<svelte:window
	on:beforeunload={() => {
		controller?.abort?.();
	}}
/>

{#if isOpen}
	<Modal>
		<h1 slot="title">YouTube</h1>

		<div data-exclude-drag-modal>
			<!-- title -->
			{#if data}
				<h2>{$lang('manage_account')}</h2>
			{:else if !event}
				<h2>{$lang('loading')}</h2>
			{:else if event?.message === 'auth-pending'}
				<h2>{$lang('log_in')}</h2>
			{/if}

			<!-- account -->
			{#if data}
				{@const contents = data?.contents?.contents?.[0]}
				{@const account_name = contents?.account_name?.text}
				{@const account_photo = contents?.account_photo?.[0]?.url}

				<div class="user" transition:slide={{ duration: $motion }}>
					<div class="user-info">
						<img src={account_photo} alt="" />

						<span>{account_name || ''}</span>

						<button
							class="action remove"
							style:margin-left="auto"
							on:click={signOut}
							use:Ripple={{
								...$ripple,
								color: 'rgba(0, 0, 0, 0.35)'
							}}
						>
							{$lang('log_out')}
						</button>
					</div>
				</div>

				<!-- auth -->
			{:else if event?.message === 'auth-pending'}
				{@const verification_url = event?.verification_url}
				{@const user_code = event?.user_code}

				{@const regex = /\[ *\{url\} *\]\( *\{url\} *\)/g}
				{@const localeAuthMessage =
					verification_url &&
					$lang('google_code') &&
					regex.test($lang('google_code')) &&
					$lang('google_code').includes('{user_code}') &&
					$lang('google_code')
						.replace(regex, `<a href="${verification_url}" target="_blank">${verification_url}</a>`)
						.replace('{user_code}', '')}

				<div transition:slide={{ duration: $motion }}>
					{#if localeAuthMessage}
						{@html localeAuthMessage}
					{:else}
						To link your Google account, visit the
						<a href={verification_url} target="_blank">{verification_url}</a> and enter code:
					{/if}

					<div class="code-container">
						<input
							bind:this={inputCode}
							class="code"
							class:copied
							on:click={() => copyCode(user_code)}
							style:transition="background-color {$motion}ms"
							type="text"
							value={user_code}
							readonly
						/>
					</div>

					<style>
						a {
							color: #00dbff;
						}
					</style>
				</div>
			{/if}

			{#if event?.message === 'error'}
				<div class="error">
					Error: {event?.error}
				</div>
			{/if}
		</div>

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.code-container {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.code {
		border: none;
		color: white;
		user-select: text;
		font-size: 1.35rem;
		background-color: var(--theme-button-background-color-off);
		border-radius: 0.6rem;
		cursor: pointer;
		width: 17rem;
		padding: 1.1rem 0;
		text-align: center;
		letter-spacing: 0.4rem;
		margin-top: 2rem;
	}

	.copied {
		background-color: #4a7110;
	}

	.user {
		background-color: rgba(0, 0, 0, 0.25);
		padding: 1rem;
		display: flex;
		border-radius: 0.6rem;
		height: 4.2rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	.user-info img {
		border-radius: 50%;
		height: 2.3rem;
		width: 2.3rem;
		background-color: rgba(0, 0, 0, 0.25);
	}

	.user-info span {
		font-size: 1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.error {
		color: red;
		margin-top: 1rem;
	}
</style>
