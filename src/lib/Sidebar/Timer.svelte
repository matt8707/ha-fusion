<script lang="ts">
	import { connection, editMode, lang, motion, ripple, states, timers } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { modals } from 'svelte-modals';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import { getName } from '$lib/Utils';

	export let sel: any;

	let interval: ReturnType<typeof setInterval>;
	let currentDate = new Date();
	let displayTime: string;
	let entity: HassEntity;

	let clicked = false;

	$: entity_id = sel?.entity_id;
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

<div class="outer">
	<div
		class="container"
		style:pointer-events={$modals.length !== 0 ? 'none' : 'unset'}
		style:cursor={$editMode || $modals.length !== 0 ? 'unset' : 'pointer'}
		style:background-color={state === 'active' && entity_id
			? 'rgba(0, 0, 0, 0.25)'
			: 'rgba(0, 0, 0, 0)'}
		style:padding={state === 'active' && entity_id
			? '0.35rem 0.65rem 0.35rem 0.45rem'
			: '0 0.65rem 0 0.45rem'}
		style:transition="color {$motion}ms ease, background-color {$motion}ms ease, padding {$motion}ms
		ease"
	>
		<div class="icon" style:color={finishes_at ? 'orange' : 'rgba(255, 255, 255, 0.5)'}>
			<Icon icon="ic:twotone-timer" height="none" />
		</div>

		<div class="column">
			<div class="name">
				{getName(sel, entity) || $lang('unknown')}
			</div>

			<div class="counter" style:color={finishes_at ? 'orange' : 'rgba(255, 255, 255, 0.5)'}>
				{#if state === 'active' && entity_id}
					{displayTime || $timers[entity_id].pausedState}
				{:else if state === 'paused' && entity_id}
					{$timers[entity_id].pausedState}
				{:else if state === 'idle' && attributes?.duration}
					{format(...parseRemaining(attributes.duration))}
				{:else}
					--:--
				{/if}
			</div>
		</div>

		{#if state}
			<button
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
			</button>
		{/if}
	</div>
</div>

<style>
	.outer {
		padding: var(--theme-sidebar-item-padding);
	}

	.container {
		display: flex;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		border-radius: 0.65rem;
		margin-left: -0.6rem;
		margin-right: -0.6rem;
	}

	.icon {
		flex-shrink: 1;
		width: 3.35rem;
		height: 3.35rem;
		align-self: center;
		margin-bottom: -0.2rem;
		margin-left: -0.25rem;
		margin-top: -0.05rem;
	}

	.column {
		display: flex;
		flex-direction: column;
		margin-left: 0.2rem;
		flex-grow: 1;
		margin-left: 0.6rem;
	}

	.name {
		margin-top: 0.1rem;
		margin-bottom: -0.2rem;
	}

	.counter {
		font-size: 1.8rem;
		transition: font-size 190ms ease;
		font-weight: 500;
	}

	.start_pause {
		flex-shrink: 1;
		width: 2.5rem;
		height: 2.5rem;
		background-color: var(--theme-navigate-background-color);
		border-radius: 50%;
		padding: 0.4rem;
		align-self: center;
		color: inherit;
		border: none;
	}
</style>
