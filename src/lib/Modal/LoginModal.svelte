<script lang="ts">
	import { configuration, connection, lang, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { Auth, genClientId, genExpires, type AuthData } from 'home-assistant-js-websocket';
	import { closeModal } from 'svelte-modals';
	import { onMount } from 'svelte';
	import Loader from '$lib/Components/Loader.svelte';
	import { webSocket } from '$lib/Socket';
	import { fade, slide } from 'svelte/transition';

	export let isOpen: boolean;

	let client_id: string;
	let flow_id: string;

	let disabled = false;
	let usernameInput: HTMLInputElement;
	let codeInput: HTMLInputElement;
	let errorMessage: string | undefined;
	let mfa_module_name: string | undefined;
	let step = 'init';

	let username = '';
	let password = '';
	let code = '';

	$: if (codeInput) codeInput.focus();

	// get flow_id and focus on username input
	onMount(async () => {
		client_id = genClientId();

		try {
			const response = await fetch('/auth/login_flow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					client_id,
					handler: ['homeassistant', null],
					redirect_uri: client_id
				})
			});

			const data = await response.json();

			flow_id = data?.flow_id;
		} catch (error) {
			console.error('error fetching flow_id:', error);
		}

		if (usernameInput) {
			usernameInput.focus();
		}
	});

	async function handleSubmit() {
		if (!flow_id || !client_id || !$configuration?.hassUrl || (step === 'mfa' && code === '')) {
			console.error({ flow_id, client_id, hassUrl: $configuration?.hassUrl, code });
			return;
		}

		// fade ui when request is in progress
		disabled = true;

		try {
			/**
			 * Submits data, 'init' step `username`, `password`
			 * and if 'mfa' step exists in response also `code`
			 */
			const payload = step === 'init' ? { username, password, client_id } : { code, client_id };
			let response = await fetch(`/auth/login_flow/${flow_id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			let data = await response.json();

			/**
			 * Handles the mfa (multi-factor authentication) step by
			 * setting the current step to 'mfa', clearing any error message,
			 * and setting the 'mfa_module_name' from response, if no errors
			 * are present. Early return, wait for mfa `code`...
			 */
			if (data?.step_id === 'mfa' && Object.keys(data?.errors)?.length === 0) {
				step = 'mfa';
				errorMessage = undefined;
				mfa_module_name = data?.description_placeholders?.mfa_module_name;
				return;
			}

			/**
			 * If `create_entry` exchange `result` for auth data
			 */
			if (data?.type === 'create_entry') {
				const body = new URLSearchParams({
					code: data.result,
					client_id,
					grant_type: 'authorization_code'
				});

				response = await fetch('/auth/token', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body
				});

				data = await response.json();

				// handle response
				if (data?.access_token) {
					handleTokens(data);
				}
			} else {
				handleError(data);
			}
		} catch (error) {
			console.error('authentication error:', error);
		} finally {
			disabled = false;
		}
	}

	async function handleTokens(data: AuthData) {
		// update data
		data.clientId = client_id;
		data.hassUrl = $configuration.hassUrl as string;
		data.expires = genExpires(data.expires_in);

		// save localStorage
		localStorage.setItem('hassTokens', JSON.stringify(data));

		// connect to websocket
		const auth = new Auth(data);
		await webSocket(auth);

		if ($connection) closeModal();
	}

	function handleError(data: any) {
		console.error('error:', data);

		if (
			data?.error?.reason === 'too_many_retry' ||
			data?.error?.message === 'Invalid flow specified'
		) {
			errorMessage = $lang('abort_login');
			step = 'abort';
			return;
		}

		const error = data?.error?.errors?.base || data?.errors?.base;
		switch (error) {
			case 'invalid_auth':
			case 'invalid_code':
				errorMessage = $lang('login_error')?.replace('{error}', $lang(error));
				break;
			default:
				errorMessage = 'An unknown error occurred';
				break;
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('login')}</h1>

		{#if disabled}
			<Loader />
		{/if}

		<div style:opacity={disabled ? '0.5' : '1'} style:transition="opacity {$motion}ms ease">
			<span
				style:background-color={errorMessage ? 'rgba(255, 0, 0, 0.34)' : 'rgba(255, 255, 255, 0.1)'}
				style:transition="background-color {$motion}ms ease"
			>
				{#if errorMessage}
					<div transition:slide={{ duration: $motion / 1.5 }}>{errorMessage}</div>
				{:else if step === 'init'}
					<div transition:slide={{ duration: $motion / 1.5 }}>
						{$lang('authorizing_client').replace('{clientId}', '"Fusion"')}
					</div>
				{:else if step === 'mfa'}
					<div transition:slide={{ duration: $motion / 1.5 }}>
						{$lang('mfa_description').replace('{mfa_module_name}', `"${mfa_module_name}"`)}
					</div>
				{/if}
			</span>

			<form on:submit|preventDefault={handleSubmit}>
				{#if step === 'init'}
					<h2>{$lang('username')}</h2>
					<input
						bind:this={usernameInput}
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
				{:else if step === 'mfa'}
					<div in:fade={{ duration: $motion }} out:slide={{ duration: $motion }}>
						<h2>{$lang('mfa_code')}</h2>
						<input
							type="text"
							bind:this={codeInput}
							bind:value={code}
							class="input"
							placeholder={$lang('code')}
						/>
					</div>
				{/if}

				{#if step === 'abort'}
					<button
						class="done action"
						on:click={() => {
							location.reload();
						}}
					>
						{$lang('start_over')}
					</button>
				{:else}
					<button
						style:transition="opacity {$motion}ms ease"
						class="done action"
						type="submit"
						disabled={disabled ||
							(step === 'init' && (username === '' || password === '')) ||
							(step === 'mfa' && code === '')}
					>
						{$lang('login')}
					</button>
				{/if}
			</form>
		</div>
	</Modal>
{/if}

<style>
	button {
		opacity: 1;
		margin-top: 2rem;
		background-color: rgb(255, 255, 255, 0.1) !important;
	}

	button:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	span {
		display: block;
		margin-top: 1rem;
		border-radius: 0.6rem;
		padding: 1.2rem;
	}
</style>
