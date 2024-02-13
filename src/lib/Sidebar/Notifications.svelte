<script lang="ts">
	import {
		connection,
		editMode,
		lang,
		motion,
		persistentNotifications,
		selectedLanguage,
		timer,
		ripple
	} from '$lib/Stores';
	import { relativeTime } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import { slide } from 'svelte/transition';
	import Ripple from 'svelte-ripple';

	function handleClick(key: string) {
		if ($editMode) return;

		callService($connection, 'persistent_notification', 'dismiss', {
			notification_id: key
		});
	}

	$: empty = Object.entries($persistentNotifications)?.length < 1;
</script>

{#if empty && $editMode}
	<div class="empty-display" transition:slide={{ duration: $motion }}>
		{$lang('notifications_empty')}
	</div>
{:else if $persistentNotifications}
	<div
		style:margin-bottom={empty ? '0' : '0.6rem'}
		style:transition="margin-bottom {$motion}ms ease"
	>
		{#each Object.entries($persistentNotifications) as [key, value] (key)}
			<div class="item" transition:slide={{ duration: $motion }}>
				<div class="inner">
					{#if value?.title}
						<div class="title">
							{value?.title}
						</div>
					{/if}

					<div class="message">
						{value?.message}
					</div>

					<div class="bottom">
						{#if $timer && value?.created_at}
							<div class="time">
								{$timer && relativeTime(value?.created_at, $selectedLanguage)}
							</div>
						{/if}

						<button
							style:pointer-events={$editMode ? 'none' : 'unset'}
							on:click={() => handleClick(key)}
							use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
						>
							{$lang('notifications_dismiss')}
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.empty-display {
		padding: var(--theme-sidebar-item-padding);
	}

	.item {
		display: grid;
		word-break: break-word;
		margin: 0 -0.6rem;
	}

	.inner {
		display: grid;
		background-color: rgba(0, 0, 0, 0.25);
		margin-top: 0.6rem;
		padding: 0.6rem;
		border-radius: 0.65rem;
		gap: 0.6rem;
	}

	.title {
		display: flex;
		font-weight: 600;
	}

	.message {
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

	button {
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
</style>
