<script lang="ts">
	/**
	 * Rewrite into smaller components!
	 */

	import { states, connection, lang, ripple } from '$lib/Stores';
	import { onMount, onDestroy } from 'svelte';
	import { callService } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Icon from '@iconify/svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let selected: any;

	let attributes: any;
	let interval: ReturnType<typeof setInterval>;
	let tick = Date.now();
	let isDragging = false;
	let debouncePosition = false;
	let debounceTimeout: ReturnType<typeof setTimeout>;
	let rangeValue = 0;
	let pendingRequest = false;
	let nextPosition: number | undefined = undefined;
	let currentSliderValue = 0;

	$: entity = $states[selected?.entity_id];
	$: attributes = entity?.attributes;
	$: playing = entity?.state === 'playing';
	$: updated_at = new Date(attributes?.media_position_updated_at).getTime();
	$: diff = (tick - updated_at) / 1000;
	$: position = attributes?.media_position + (playing ? diff : 0);

	const DEBOUNCE_INTERVAL = 2500;

	onMount(() => {
		if (playing) {
			interval = setInterval(() => {
				tick = Date.now();
			}, 1000);
		} else {
			tick = Date.now();
		}
	});

	$: rangeValue =
		!debouncePosition && !isDragging
			? Math.min(position || 0, attributes?.media_duration || 0)
			: rangeValue;

	onMount(() => {
		// selectedSource = attributes?.source_list?.includes(attributes?.app_name)
		// 	? attributes?.app_name
		// 	: '';
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	async function handleChange(value: number) {
		currentSliderValue = value;
		debouncePosition = true;
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			debouncePosition = false;
			rangeValue = position || 0;
		}, DEBOUNCE_INTERVAL);
		if (pendingRequest) {
			if (nextPosition !== value) {
				nextPosition = value;
			}
		} else {
			pendingRequest = true;
			try {
				await callService($connection, 'media_player', 'media_seek', {
					entity_id: entity?.entity_id,
					seek_position: value
				});
			} catch (error) {
				console.error('Failed to change position:', error);
			}
			pendingRequest = false;
			if (nextPosition !== undefined && nextPosition !== value) {
				const position = nextPosition;
				nextPosition = undefined;
				handleChange(position);
			}
		}
	}

	function handleClick(service: string) {
		callService($connection, 'media_player', service, {
			entity_id: entity?.entity_id
		});
	}

	function convertToHMS(seconds: number) {
		if (seconds) {
			const h = Math.floor(seconds / 3600);
			const m = Math.floor((seconds % 3600) / 60);
			const s = Math.floor(seconds % 60);
			const hDisplay = h > 0 ? h + ':' : '';
			const mDisplay = m < 10 ? '0' + m + ':' : m + ':';
			const sDisplay = s < 10 ? '0' + s : s;
			return hDisplay + mDisplay + sDisplay;
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		<h2>
			{#if attributes?.media_artist}
				{attributes?.media_artist}
			{/if}

			{#if attributes?.media_artist && attributes?.media_title}
				-
			{/if}

			{#if attributes?.media_title}
				{attributes?.media_title}
			{/if}
		</h2>

		{#if attributes?.media_artist || attributes?.media_title}
			{#if attributes?.entity_picture}
				<img src={attributes?.entity_picture} alt={attributes?.media_title} />
			{/if}
		{/if}

		{#if attributes?.media_position && attributes?.media_duration}
			<div class="time-container">
				<div class="current-time">
					{#if isDragging || debouncePosition}
						{convertToHMS(currentSliderValue) || '00:00'}
					{:else}
						{convertToHMS(rangeValue)}
					{/if}
				</div>
				<div class="duration-time">
					{convertToHMS(attributes?.media_duration)}
				</div>
			</div>
		{/if}

		{#if attributes?.media_duration !== undefined && attributes?.media_position !== undefined && attributes?.media_position_updated_at}
			<RangeSlider
				value={rangeValue}
				min={0}
				max={attributes?.media_duration}
				on:input={(event) => {
					handleChange(event.detail);
				}}
				on:dragging={(event) => {
					isDragging = event.detail;
					if (event.detail) {
						clearTimeout(debounceTimeout);
					}
				}}
			/>

			<br />
		{/if}

		<div class="icon-container">
			<!-- previous -->
			<button
				use:Ripple={$ripple}
				on:click={() => {
					handleClick('media_previous_track');
				}}
			>
				<Icon icon="ic:round-fast-rewind" height="none" />
			</button>

			<!-- pause -->
			<button
				use:Ripple={$ripple}
				style:display={entity?.state === 'playing' ? 'block' : 'none'}
				on:click={() => {
					handleClick('media_pause');
				}}
			>
				<Icon icon="ic:round-pause" height="none" />
			</button>

			<!-- play -->
			<button
				on:click={() => handleClick('media_play')}
				use:Ripple={$ripple}
				style:display={entity?.state !== 'playing' ? 'block' : 'none'}
			>
				<Icon icon="ic:round-play-arrow" height="none" />
			</button>

			<!-- next -->
			<button on:click={() => handleClick('media_next_track')} use:Ripple={$ripple}>
				<Icon icon="ic:round-fast-forward" height="none" />
			</button>
		</div>

		<br />

		{$lang('volume_level')}

		<div class="vol-container">
			<!-- volume_up -->
			<button on:click={() => handleClick('volume_up')} use:Ripple={$ripple}>
				<div style="scale: 90%; margin-bottom: -0.2rem;">
					<Icon icon="typcn:plus" height="none" />
				</div>
			</button>

			<!-- vol text -->
			<div>VOL</div>

			<!-- volume_down -->
			<button
				use:Ripple={$ripple}
				on:click={() => {
					handleClick('volume_down');
				}}
			>
				<div style="scale: 90%; margin-bottom: -0.2rem;">
					<Icon icon="typcn:minus" height="none" />
				</div>
			</button>
		</div>
	</Modal>
{/if}

<style>
	.time-container {
		display: flex;
		justify-content: space-between;
		margin: 0.8em 0 0.6em 0;
		font-weight: 500;
	}

	.icon-container {
		display: flex;
		justify-content: space-between;
		width: 70%;
		margin: auto;
	}

	.vol-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	img {
		width: 100%;
		border-radius: 0.6em;
		pointer-events: none;
		align-self: center;
		margin-top: 0.8rem;
		margin-bottom: 1.2rem;
		box-shadow:
			rgba(0, 0, 0, 0.3) 0px 19px 38px,
			rgba(0, 0, 0, 0.22) 0px 15px 12px;
	}

	button {
		width: 3.8rem;
		height: 3.8rem;
		color: inherit;
		border: none;
		cursor: pointer;
		background-color: unset;
		padding: 0;
		border-radius: 0.8rem;
	}
</style>
