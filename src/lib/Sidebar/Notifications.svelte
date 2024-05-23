<script lang="ts">
	import {
		connection,
		editMode,
		lang,
		motion,
		persistentNotifications,
		selectedLanguage,
		timer,
		ripple,
		configuration
	} from '$lib/Stores';
	import { relativeTime } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import { slide } from 'svelte/transition';
	import Ripple from 'svelte-ripple';
	import { marked } from 'marked';

	export let sel: any = undefined;
	let expanded = false;

	$: length = Object.entries($persistentNotifications)?.length;
	$: empty = length < 1;

	function handleClick(key: string) {
		if ($editMode) return;

		// if last item collapse
		if (length === 1) {
			expanded = false;
		}

		callService($connection, 'persistent_notification', 'dismiss', {
			notification_id: key
		});
	}

	// modify markdown links
	marked.setOptions({
		renderer: (() => {
			const renderer = new marked.Renderer();
			const linkRenderer = renderer.link;
			renderer.link = (href, title, text) => {
				const localLink = href.startsWith('/');

				if (localLink && $configuration?.hassUrl) {
					href = `${$configuration?.hassUrl}${href}`;
				}

				const html = linkRenderer.call(renderer, href, title, text);
				return html.replace(/^<a /, `<a target="_blank" `);
			};
			return renderer;
		})()
	});
</script>

{#if sel?.expand === false || (empty && $editMode)}
	<div
		transition:slide={{ duration: $motion }}
		class="toggle"
		style:cursor={$editMode || empty ? 'unset' : 'pointer'}
		on:click={() => {
			if ($editMode || empty) return;
			expanded = !expanded;
		}}
		on:keydown
		role="button"
		tabindex="0"
	>
		{#if !empty}
			{length}
		{/if}
		{$lang(empty ? 'notifications_empty' : 'notifications')}
	</div>
{/if}

<div
	class="container"
	style:margin-bottom={(sel?.expand === false && !expanded) || empty ? '0' : '0.6rem'}
	style:grid-template-rows={(sel?.expand === false && !expanded) || !sel?.expand === undefined
		? '0fr'
		: '1fr'}
	style:transition="margin-bottom {$motion}ms ease, grid-template-rows {$motion}ms ease"
>
	<div style:overflow="hidden">
		{#each Object.entries($persistentNotifications) as [key, value] (key)}
			<div class="item" transition:slide={{ duration: $motion }}>
				{#if Object.keys($persistentNotifications)?.length > 0}
					<div class="inner">
						{#if value?.title}
							<div class="notification-title">
								{@html marked.parse(value?.title)}
							</div>
						{/if}

						<div class="notification-message">
							{@html marked.parse(value?.message)}
						</div>

						<div class="bottom">
							{#if $timer && value?.created_at}
								<div class="time">
									{$timer && relativeTime(value?.created_at, $selectedLanguage)}
								</div>
							{/if}

							<button
								class="dismiss"
								style:pointer-events={$editMode ? 'none' : 'unset'}
								on:click={() => handleClick(key)}
								use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
							>
								{$lang('notifications_dismiss')}
							</button>
						</div>

						<style>
							/* remove marked p margin */
							.notification-title p,
							.notification-message p {
								all: unset;
							}

							.notification-title a,
							.notification-message a {
								color: rgb(36 167 255);
							}
						</style>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		display: grid;
	}

	.item {
		display: grid;
		word-break: break-word;
	}

	.inner {
		display: grid;
		background-color: rgba(0, 0, 0, 0.25);
		margin-top: 0.6rem;
		padding: 0.6rem;
		border-radius: 0.65rem;
		gap: 0.6rem;
	}

	.notification-title {
		display: flex;
		font-weight: 600;
	}

	.notification-message {
		display: flex;
		font-size: 0.95rem;
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.time {
		opacity: 0.5;
		font-size: 0.9rem;
	}

	.dismiss {
		all: unset;
		padding: 0.4rem 0.7rem;
		border-radius: 0.35rem;
		font-weight: 500;
		font-size: 0.8rem;
		background: #ffc008;
		color: #3b0f0f;
		border: inherit;
		font-family: inherit;
		white-space: nowrap;
		cursor: pointer;
	}

	.toggle {
		padding: var(--theme-sidebar-item-padding);
		width: 100%;
		display: flex;
	}
</style>
