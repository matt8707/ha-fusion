<script lang="ts">
	import { configuration, lang, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { Auth } from 'home-assistant-js-websocket';
	import { closeModal } from 'svelte-modals';
	import { onMount } from 'svelte';
	import Loader from '$lib/Components/Loader.svelte';
	import { webSocket } from '$lib/Socket';
	import { base } from '$app/paths';
	import { fade, slide } from 'svelte/transition';

	export let isOpen: boolean;
	export let clientId: string | undefined;
	export let flow_id: string | undefined;

	let invalidAuth: string | undefined;
	let disabled = false;
	let focusElement: HTMLInputElement;
	let step = 'init';
	let mfa_module_name: string | undefined;

	let username = '';
	let password = '';
	let code = '';

	async function handleSubmit() {
		if (!flow_id || (step === 'mfa' && code === '')) return;
		disabled = true;

		try {
			// submit data
			const payload = step === 'init' ? { username, password, clientId } : { code, clientId };
			const response = await fetch(`${base}/api/auth/${flow_id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();

			// if response is mfa change step
			if (data?.step_id === 'mfa' && Object.keys(data?.errors)?.length === 0) {
				step = 'mfa';

				invalidAuth = undefined;
				mfa_module_name = data?.description_placeholders?.mfa_module_name;
				return;
			}

			// handle response
			if (data?.access_token) {
				handleSuccess(data);
			} else {
				handleError(data);
			}
		} catch (error) {
			console.error('authentication error:', error);
		} finally {
			disabled = false;
		}
	}

	async function handleSuccess(data: any) {
		// update data
		data.clientId = clientId;
		data.hassUrl = $configuration?.hassUrl;
		data.expires = data.expires_in * 1000 + Date.now();

		// save localStorage
		localStorage.setItem('auth', JSON.stringify(data));

		// connect to websocket
		const auth = new Auth({ ...data, hassUrl: $configuration?.hassUrl, clientId });
		await webSocket(auth);

		closeModal();
	}

	function handleError(data: any) {
		console.error('error:', data);

		if (
			data?.error?.reason === 'too_many_retry' ||
			data?.error?.message === 'Invalid flow specified'
		) {
			invalidAuth = $lang('abort_login');
			step = 'abort';
			return;
		}

		const error = data?.error?.errors?.base || data?.errors?.base;
		switch (error) {
			case 'invalid_auth':
			case 'invalid_code':
				invalidAuth = $lang('login_error')?.replace('{error}', $lang(error));
				break;
			default:
				invalidAuth = 'An unknown error occurred';
				break;
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
					<div transition:slide={{ duration: $motion / 1.5 }}>{invalidAuth}</div>
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
				{:else if step === 'mfa'}
					<div in:fade={{ duration: $motion }} out:slide={{ duration: $motion }}>
						<h2>{$lang('mfa_code')}</h2>
						<input type="text" bind:value={code} class="input" placeholder={$lang('code')} />
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
