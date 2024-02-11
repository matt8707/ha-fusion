<script lang="ts">
	import {
		config,
		connected,
		dashboard,
		lang,
		motion,
		connection,
		event,
		configuration
	} from '$lib/Stores';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let message: string | undefined;
	let prev: string | undefined;
	let timeout: ReturnType<typeof setTimeout>;

	/**
	 * Handle message timeouts
	 */
	function setTimeoutHandler(type: string) {
		clearTimeout(timeout);
		const duration = type === 'started' ? 3500 : 2000;

		timeout = setTimeout(() => {
			if (type === 'started' && $config?.state === 'RUNNING') {
				message = undefined;
				prev = 'CONNECTED';
			} else if (type === 'ERR_HASS_HOST_REQUIRED' && !$connected) {
				message = 'ERR_HASS_HOST_REQUIRED';
			} else if (type === 'error' && !$connected) {
				message = 'ERR_CANNOT_CONNECT';
			}
		}, duration);
	}

	/**
	 * Toast connection message
	 */
	$: {
		/**
		 * Socket doesn't properly set $connected, but at least triggers reactivity
		 * Use below to actually test if $connection is $connected.
		 */
		$connected =
			$connection?.socket !== undefined &&
			$connection?.socket?.readyState == $connection?.socket?.OPEN;

		if ($connected) {
			message = undefined;

			if ($config?.state === 'RUNNING') {
				// STARTED
				if (prev === 'STARTING') {
					message = $lang('connection_started');
					setTimeoutHandler('started');

					//DEFAULT
				} else {
					prev = 'CONNECTED';
				}

				// STARTING...
			} else if ($config?.state === 'NOT_RUNNING') {
				prev = 'STARTING';
				message = $lang('connection_starting');
			}

			/**
			 * !$connected
			 */
		} else {
			// LOST...
			if (prev === 'CONNECTED') {
				message = $lang('connection_lost');

				// ERR_HASS_HOST_REQUIRED
			} else if (!$configuration?.hassUrl) {
				setTimeoutHandler('ERR_HASS_HOST_REQUIRED');

				// ERR_CANNOT_CONNECT
			} else {
				// setTimeoutHandler('error');
			}
			prev = undefined;
		}
	}

	onMount(() => {
		// if event is 'refresh' it's temporarily stored in sessionStorage
		if (sessionStorage.getItem('event') === 'refresh') {
			$event = 'refresh';
			sessionStorage.removeItem('event');
		}
	});

	onDestroy(() => clearTimeout(timeout));

	// external event toast
	$: if ($event) displayEvent();
	function displayEvent() {
		clearTimeout(timeout);
		message = $lang('event_fired')?.replace('{type}', `"${$event}"`);

		timeout = setTimeout(() => {
			message = undefined;
			$event = undefined;
		}, 3500);
	}
</script>

{#if message}
	<div
		transition:fade={{ duration: $motion }}
		style:width="calc({$dashboard?.sidebarWidth}px - 2.8rem)"
		style:background={message === 'ERR_CANNOT_CONNECT' || message === 'ERR_HASS_HOST_REQUIRED'
			? '#ba0000'
			: 'var(--theme-navigate-background-color)'}
	>
		{message}
	</div>
{/if}

<style>
	div {
		position: fixed;
		padding: 0.5rem 0.6rem;
		border-radius: 0.4rem;
		color: inherit;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
		bottom: 1.4rem;
		left: 1.4rem;
	}
</style>
