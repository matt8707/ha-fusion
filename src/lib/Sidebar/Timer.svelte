<script lang="ts">
	import { connection, editMode, lang, motion, ripple, states, timers } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { modals } from 'svelte-modals';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';

	export let entity_id: string | undefined = undefined;

	let interval: ReturnType<typeof setInterval>;
	let currentDate = new Date();
	let displayTime: string;
	let entity: HassEntity;

	let clicked = false;

	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[entity_id];
	}

	$: state = entity?.state;
	$: attributes = entity?.attributes;
	$: finishes_at = attributes?.finishes_at;
	$: remaining = attributes?.remaining;
	$: end = new Date(finishes_at);
	$: if (end) init();
	$: service = state === 'active' ? 'pause' : 'start';

	// make pausedState global to sync across components
	$: if (state === 'paused' && remaining && !clicked) {
		timers.update((currentTimers) => {
			if (entity_id) {
				return {
					...currentTimers,
					[entity_id]: {
						...currentTimers[entity_id],
						pausedState: format(...parseRemaining(remaining))
					}
				};
			}
			return currentTimers;
		});
	}

	function init() {
		clearInterval(interval);
		update();
		interval = setInterval(update, 1000);
	}

	function update() {
		currentDate.setTime(Date.now());
		const diff = end.getTime() - currentDate.getTime();
		if (diff > 0) displayTime = calculate(diff);
	}

	function calculate(ms: number): string {
		const h = Math.floor(ms / (1000 * 60 * 60));
		const m = Math.floor((ms / (1000 * 60)) % 60);
		const s = Math.floor((ms / 1000) % 60);
		return format(h, m, s);
	}

	function format(h: number, m: number, s: number): string {
		return h
			? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
			: m
				? `${m}:${String(s).padStart(2, '0')}`
				: `0:${String(s).padStart(2, '0')}`;
	}

	function parseRemaining(timeString: string): [number, number, number] {
		const parts = timeString.split(':').map(Number);
		while (parts.length < 3) {
			parts.unshift(0);
		}
		return [parts[0], parts[1], parts[2]];
	}

	function handleClick(event: { stopPropagation: () => void }) {
		// set 'clicked' flag to prevent 'pausedState'
		// reactivity once interacted with at least once
		clicked = true;

		if (!$editMode) {
			event.stopPropagation();
			callService($connection, 'timer', service, { entity_id });

			// prevents flickering
			if (state === 'active') {
				// store current time when pausing
				timers.update((currentTimers) => {
					if (entity_id) {
						return {
							...currentTimers,
							[entity_id]: {
								...currentTimers[entity_id],
								pausedState: displayTime
							}
						};
					}
					return currentTimers;
				});
			}
		}
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="outer">
	<div
		class="container"
		style:pointer-events={$modals.length !== 0 ? 'none' : 'unset'}
		style:cursor={$editMode || $modals.length !== 0 ? 'unset' : 'pointer'}
		style:transition="background-color {$motion}ms ease"
		style:background-color={state === 'active' && entity_id
			? 'rgba(0, 0, 0, 0.25)'
			: 'rgba(0, 0, 0, 0)'}
	>
		<div
			class="timer"
			style:color={finishes_at ? 'orange' : 'rgba(255, 255, 255, 0.5)'}
			style:transition="color {$motion}ms ease"
		>
			<div class="icon">
				<Icon icon="ic:twotone-timer" height="none" />
			</div>

			<span style:margin-top="0.1rem">
				{#if state === 'active' && entity_id}
					{displayTime || $timers[entity_id].pausedState}
				{:else if state === 'paused' && entity_id}
					{$timers[entity_id].pausedState}
				{:else if state === 'idle'}
					{$lang('idle')}
				{:else}
					--:--
				{/if}
			</span>
		</div>

		{#if state}
			<div
				class="start_pause"
				style:cursor={$editMode ? 'unset' : 'pointer'}
				style:pointer-events={$modals.length !== 0 ? 'auto' : 'unset'}
				on:click={handleClick}
				use:Ripple={{
					...$ripple,
					opacity: $editMode ? '0' : $ripple.opacity
				}}
			>
				{#if state === 'active'}
					<Icon icon="ic:round-pause" height="none" />
				{:else}
					<Icon icon="ic:round-play-arrow" height="none" />
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.outer {
		padding: var(--theme-sidebar-item-padding);
	}

	.container {
		padding: var(--theme-sidebar-item-padding);
		display: flex;
		justify-content: space-between;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		border-radius: 0.65rem;
		margin-left: -0.6rem;
		margin-right: -0.6rem;
		padding: 0.45rem 0.65rem 0.45rem 0.45rem;
	}

	.timer {
		display: flex;
		gap: 0.4rem;
		font-weight: 500;
		font-size: 2.2rem;
		line-height: 2.25rem;
		transition: font-size 190ms ease;
		border-radius: 0.2em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-left: -0.1rem;
		align-self: center;
	}

	.icon {
		width: 2.4rem;
		height: 2.4rem;
		padding-top: 0.08rem;
	}

	.start_pause {
		width: 2.2rem;
		height: 2.2rem;
		background-color: var(--theme-navigate-background-color);
		border: none;
		color: inherit;
		border-radius: 50%;
		padding: 0.3rem;
		margin-top: 0.1rem;
		font-size: inherit;
	}
</style>
