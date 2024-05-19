<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { base } from '$app/paths';
	import { onDestroy, onMount, tick } from 'svelte';
	import { closeModal } from 'svelte-modals';
	import { lang, motion, ripple, youtubeAddon } from '$lib/Stores';
	import { slide } from 'svelte/transition';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;

	let message: any;
	let evtSource: EventSource;
	let copied = false;

	$: if (message?.error) console.error(message?.error);

	$: data = message?.data?.contents?.contents?.[0];
	$: user = data?.account_name?.text;
	$: img = data?.account_photo?.[0]?.url;

	const regexUrl = /\[ *\{url\} *\]\( *\{url\} *\)/g;

	$: url = message?.verification_url;
	$: code = message?.user_code;

	$: authMessage =
		url &&
		$lang('google_code') &&
		regexUrl.test($lang('google_code')) &&
		$lang('google_code').includes('{user_code}') &&
		$lang('google_code')
			.replace(regexUrl, `<a href="${url}" target="_blank">${url}</a>`)
			.replace('{user_code}', '');

	function signIn() {
		evtSource = new EventSource(`${base}/_api/youtube`);

		evtSource.onmessage = (event) => {
			message = JSON.parse(event.data);

			// close after data is recieved
			if (message?.data) evtSource.close();
		};

		// error
		evtSource.onerror = (err) => {
			console.error('EventSource failed:', err);
			evtSource.close();
		};
	}

	async function signOut() {
		try {
			const response = await fetch(`${base}/_api/youtube`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ action: 'sign-out' })
			});

			if (response.ok) {
				const result = await response.text();
				console.log(result);

				await tick();

				$youtubeAddon = false;
				closeModal();
			} else {
				message.error = 'Failed to sign out';
			}
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	async function copyCode(user_code: string) {
		try {
			await navigator.clipboard.writeText(user_code);

			copied = true;
			setTimeout(() => (copied = false), $motion * 2);
		} catch (err: any) {
			console.error(err?.message);
			copied = false;
		}
	}

	onMount(() => signIn());

	onDestroy(() => evtSource?.close?.());
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">YouTube</h1>

		{#if user && img}
			<h2>{$lang('manage_account')}</h2>
		{:else if url && code}
			<h2>{$lang('log_in')}</h2>
		{:else}
			<h2>{$lang('loading')}</h2>
		{/if}

		<div data-exclude-drag-modal>
			<!-- user -->
			{#if user && img}
				<div class="user" transition:slide={{ duration: $motion }}>
					<div class="user-info">
						<img src={img} alt="" />

						<span>{user}</span>

						<button
							class="action remove"
							on:click={signOut}
							style:margin-left="auto"
							use:Ripple={{
								...$ripple,
								color: 'rgba(0, 0, 0, 0.35)'
							}}
						>
							{$lang('log_out')}
						</button>
					</div>
				</div>

				<!-- code -->
			{:else if url && code}
				<div transition:slide={{ duration: $motion }}>
					<style>
						a {
							color: #00dbff;
						}
					</style>

					{#if authMessage}
						{@html authMessage}
					{:else}
						To link your Google account, visit the <a href={url} target="_blank">{url}</a> and enter
						code:
					{/if}

					<div class="code-container">
						<button
							class="code"
							class:copied
							on:click={() => copyCode(code)}
							style:transition="background-color {$motion / 2}ms"
						>
							<code>{code}</code>
						</button>
					</div>
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
		all: unset;
		margin-top: 1.5rem;
		user-select: text;
		font-size: 1.5rem;
		background-color: var(--theme-button-background-color-off);
		padding: 0.8rem 1rem;
		border-radius: 0.6rem;
		cursor: pointer;
	}

	.copied {
		background-color: #4a7110;
	}

	.user {
		background-color: rgba(0, 0, 0, 0.25);
		padding: 1rem;
		display: flex;
		border-radius: 0.6rem;
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
</style>
