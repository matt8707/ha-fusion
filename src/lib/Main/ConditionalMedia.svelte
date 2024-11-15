<script lang="ts">
	import {
		states,
		connection,
		itemHeight,
		editMode,
		youtubeData,
		youtubeAddon,
		lang,
		ripple,
		motion
	} from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import { getName } from '$lib/Utils';
	import { openModal, modals } from 'svelte-modals';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import { base } from '$app/paths';
	import { callService, type HassEntities, type HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import Progress from '$lib/Components/Progress.svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut, expoOut } from 'svelte/easing';
	import Ripple from 'svelte-ripple';

	export let sel: any;
	export let demo: string | undefined = undefined;

	const debug = false;

	let contentWidth: number;
	let backgroundImage: string | undefined;
	let pausedTimeout: ReturnType<typeof setTimeout>;
	let timeoutOverlay: ReturnType<typeof setTimeout>;
	let pauseExpired = false;
	let cancelAsyncFetch: boolean;
	let remaining: number | undefined;
	let overlayIconState: string | undefined;

	// nothing_playing entity
	$: entity = $states?.[demo || sel?.entity_id];
	$: entity_data = entity?.attributes?.data?.[1];
	$: fanart = entity_data?.fanart;
	$: poster = entity_data?.poster;
	$: entity_entity_picture = entity?.attributes?.entity_picture;

	// isolate each attribute to prevent mass reactivity
	$: current_media_player = getCurrent(sel?.media_players, $states, pauseExpired, timeout);
	$: currentEntityId = current_media_player?.entity_id;
	$: currentState = current_media_player?.state;
	$: currentAttr = current_media_player?.attributes;
	$: media_artist = currentAttr?.media_artist;
	$: media_title = currentAttr?.media_title;
	$: app_id = currentAttr?.app_id;
	$: entity_picture = currentAttr?.entity_picture;

	// paused media_player state, expire in seconds
	$: timeout = sel?.timeout ?? 900;
	$: if (currentEntityId || currentState || timeout || sel?.show_timeout) handlePaused(false);

	$: active = currentState === 'playing' || (currentState === 'paused' && !pauseExpired);

	// set background image
	$: if ($youtubeAddon && app_id === 'com.google.ios.youtube' && active) {
		youtubeThumbnail(media_artist, media_title);
	} else if (entity_picture && active) {
		entityPicture();
	} else if (!entity_picture && active) {
		noEntityPicture();
	} else {
		nothingPlaying(fanart, poster, entity_entity_picture);
	}

	onMount(() => handlePaused(true));

	function getCurrent(
		media_players: HassEntity[],
		states: HassEntities,
		pauseExpired: boolean,
		timeout: number
	): HassEntity | undefined {
		if (!media_players) return undefined;

		const list = media_players
			?.map(({ entity_id }) => states?.[entity_id])
			?.filter((entity) => entity)
			?.sort((a, b) => new Date(b?.last_changed)?.getTime() - new Date(a?.last_changed)?.getTime());

		if (list?.length === 0) return undefined;
		const last_changed = list?.[0];

		if (timeout === 0) {
			const find_playing = list?.find((entity) => entity?.state === 'playing');
			if (debug) console.debug(`no timeout --> find playing (${find_playing?.entity_id})`);
			return find_playing;
		}

		if (last_changed?.state === 'playing') {
			if (debug) console.debug(`last_changed is playing (${last_changed?.entity_id})`);
			return last_changed;
		}

		if (last_changed?.state === 'paused') {
			if (currentState === 'playing') {
				return list?.find((entity) => entity?.entity_id === currentEntityId);
			}

			if (!pauseExpired) {
				if (debug) console.debug(`last_changed is paused (${last_changed?.entity_id}) NOT EXPIRED`);
				return last_changed;
			} else {
				const first_playing = list?.find((entity) => entity?.state === 'playing');
				if (first_playing) {
					if (debug)
						console.debug(
							`last_changed is paused (${last_changed?.entity_id}) EXPIRED -> find playing (${first_playing?.entity_id})`
						);
					return first_playing;
				} else {
					if (debug)
						console.debug(`last_changed is paused (${last_changed?.entity_id}) EXPIRED -> entity`);
					return;
				}
			}
		}

		// else
		const find_playing = list?.find((entity) => entity?.state === 'playing');
		if (debug) console.debug(`find playing (${find_playing?.entity_id})`);
		return find_playing;
	}

	async function handlePaused(mount?: boolean) {
		clearTimeout(pausedTimeout);

		// paused
		if (currentState === 'paused') {
			if (!current_media_player) return;

			const current_last_changed = new Date(current_media_player?.last_changed);
			const diff = Math.abs((new Date()?.getTime() - current_last_changed?.getTime()) / 1000);
			remaining = undefined;

			if (diff > timeout) {
				pauseExpired = true;
			} else {
				remaining = (timeout - diff) * 1000;

				if (debug) {
					const remainingSeconds = Math.round(remaining / 1000);
					console.debug('Paused media_player expires in', remainingSeconds, 'seconds!');
				}

				pausedTimeout = setTimeout(() => {
					pauseExpired = true;
				}, remaining);
			}

			// not paused
		} else {
			pauseExpired = false;
			remaining = undefined;
		}

		// force update onmount
		if (mount) current_media_player = current_media_player;
	}

	async function youtubeThumbnail(media_artist: string, media_title: string) {
		backgroundImage = undefined;
		cancelAsyncFetch = false;
		if (!media_artist || !media_title) return;

		// screensaver nonsense
		if (media_artist === 'YouTube' && media_title === 'Ambient Display') {
			backgroundImage = undefined;
			return;
		}

		// cached
		if (media_artist === $youtubeData?.media_artist && media_title === $youtubeData?.media_title) {
			backgroundImage = `url("${$youtubeData?.entity_picture}")`;
			return;
		}

		if (debug) console.debug('youtubeThumbnail()');

		try {
			const response = await fetch(`${base}/_api/youtube`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: 'history',
					media_artist,
					media_title
				})
			});

			$youtubeData = await response.json();

			// need to cancel async fetch if another
			// function starts before this finishes
			if (cancelAsyncFetch) return;

			if ($youtubeData?.entity_picture) {
				backgroundImage = `url("${$youtubeData?.entity_picture}")`;
			} else {
				console.error("Couldn't fetch YouTube thumbnail");
				backgroundImage = undefined;
			}
		} catch (err: any) {
			console.error(err);
		}
	}

	function entityPicture() {
		backgroundImage = undefined;
		cancelAsyncFetch = true;
		if (debug) console.debug('entityPicture()');
		backgroundImage = `url("${entity_picture}")`;
	}

	function noEntityPicture() {
		backgroundImage = undefined;
		cancelAsyncFetch = true;
		if (debug) console.debug('noEntityPicture()');
		backgroundImage = undefined;
	}

	function nothingPlaying(
		fanart: string,
		poster: string,
		entity_entity_picture: string | undefined
	) {
		backgroundImage = undefined;
		cancelAsyncFetch = true;
		if (debug) console.debug('nothingPlaying()');
		if (fanart || poster) {
			backgroundImage = `url("${fanart || ''}"), url("${poster || ''}")`;
		} else {
			// fallback for non-media players, for example camera
			backgroundImage = (entity_entity_picture && `url("${entity_entity_picture}")`) || undefined;
		}
	}

	async function handleClick() {
		if ($modals?.length > 0) return;

		if ($editMode) {
			openModal(() => import('$lib/Modal/ConditionalMediaConfig.svelte'), {
				sel
			});
		} else {
			if (active) {
				// icon
				if (currentState === 'playing') {
					overlayIconState = 'paused';
				} else if (currentState === 'paused') {
					overlayIconState = 'playing';
					currentState = 'playing';
				} else {
					overlayIconState = undefined;
				}

				await callService($connection, 'media_player', 'media_play_pause', {
					entity_id: current_media_player?.entity_id
				});

				clearTimeout(timeoutOverlay);
				timeoutOverlay = setTimeout(
					() => {
						overlayIconState = undefined;
					},
					overlayIconState === 'playing' ? 600 : 900
				);
			}
		}
	}
</script>

<div
	data-exclude-drag-modal
	on:keydown
	tabindex="0"
	role="button"
	on:click={handleClick}
	class="container"
	style:background-image={backgroundImage}
	style:height="calc({$itemHeight}px * 4 + 0.4rem * 3)"
	style:cursor={$editMode || !active ? 'unset' : 'pointer'}
	use:Ripple={{
		...$ripple,
		opacity: !$editMode && active ? $ripple.opacity : '0'
	}}
>
	<!-- overlay icon -->
	<div class="overlay-icon">
		{#if overlayIconState === 'playing'}
			<div
				class="icon-state"
				in:fly={{ duration: $motion * 2, y: 10, easing: expoOut }}
				out:fade={{ duration: $motion, easing: cubicOut }}
			>
				<Icon icon="ic:round-play-arrow" width="5rem" height="100%" />
			</div>
		{:else if overlayIconState === 'paused'}
			<div
				class="icon-state"
				in:fly={{ duration: $motion * 2, y: 10, easing: expoOut }}
				out:fade={{ duration: $motion, easing: cubicOut }}
			>
				<Icon icon="ic:round-pause" width="5rem" height="100%" />
			</div>
		{/if}
	</div>

	<!-- paused progress -->
	{#if sel?.show_timeout && !$editMode && remaining && currentState === 'paused' && !pauseExpired}
		<div
			class="progress"
			in:fade={{ duration: $motion * 4, easing: expoOut }}
			out:fade={{ duration: $motion / 2, easing: cubicOut }}
		>
			{#key currentEntityId}
				<Progress duration={remaining} size={45} stroke={7} />
			{/key}
		</div>
	{/if}

	{#if !sel?.hide_name}
		<div
			class="background"
			style:background-color={!backgroundImage ? 'none' : 'rgba(0, 0, 0, 0.25)'}
			style:backdrop-filter={!backgroundImage ? 'none' : 'blur(1rem)'}
			style:-webkit-backdrop-filter={!backgroundImage ? 'none' : 'blur(1rem)'}
		>
			<div class="left">
				<div class="icon">
					<!-- activePlayer -->

					{#if active}
						{#if currentAttr?.icon}
							<Icon icon={currentAttr?.icon} height="auto" width="100%" />
						{:else if current_media_player}
							<ComputeIcon entity_id={current_media_player?.entity_id} skipEntityPicture={true} />
						{/if}

						<!-- nothing_playing -->
					{:else if sel?.icon || entity?.attributes?.icon}
						<Icon icon={sel?.icon || entity?.attributes?.icon} height="auto" width="100%" />
					{:else if sel?.entity_id}
						<ComputeIcon entity_id={sel?.entity_id} skipEntityPicture={true} />
					{:else}
						<Icon icon="ooui:help-ltr" height="auto" width="100%" />
					{/if}
				</div>
			</div>

			<div class="right">
				{#if active}
					<!-- activePlayer -->

					<div class="name">
						{getName(undefined, current_media_player)}
					</div>

					<div class="state">
						<div class="measure" bind:clientWidth={contentWidth}>
							<!-- snippet -->
							{#if media_artist && media_title}
								{media_artist} - {media_title}
							{:else if media_artist && !media_title}
								{media_artist}
							{:else if !media_artist && media_title}
								{media_title}
							{:else}
								<StateLogic entity_id={current_media_player?.entity_id} selected={undefined} />
							{/if}
						</div>

						<div style="overflow: hidden; text-overflow: ellipsis;">
							{#if sel?.marquee === true && contentWidth && contentWidth > 394 && !$editMode}
								{#await import('$lib/Components/Marquee.svelte')}
									loading
								{:then Marquee}
									<svelte:component this={Marquee.default}>
										<!-- snippet -->
										{#if media_artist && media_title}
											{media_artist} - {media_title}
										{:else if media_artist && !media_title}
											{media_artist}
										{:else if !media_artist && media_title}
											{media_title}
										{:else}
											<StateLogic entity_id={current_media_player?.entity_id} selected={undefined} />
										{/if}
										{@html '&nbsp;'.repeat(4)}
									</svelte:component>
								{/await}
							{:else}
								<!-- snippet -->
								{#if media_artist && media_title}
									{media_artist} - {media_title}
								{:else if media_artist && !media_title}
									{media_artist}
								{:else if !media_artist && media_title}
									{media_title}
								{:else}
									<StateLogic entity_id={current_media_player?.entity_id} selected={undefined} />
								{/if}
							{/if}
						</div>
					</div>
				{:else}
					<!-- nothing_playing -->

					<div class="name">
						{sel?.name || getName(undefined, entity) || $lang('nothing_playing')}
					</div>

					<div class="state">
						<div class="measure" bind:clientWidth={contentWidth}>
							<!-- snippet -->
							{#if entity_data?.title}
								{entity_data?.title}

								{#if entity_data?.aired}
									({entity_data?.aired?.split('-')?.[0]})
								{/if}
							{:else}
								<StateLogic entity_id={sel?.entity_id} selected={sel} />
							{/if}
						</div>

						<div style="overflow: hidden; text-overflow: ellipsis;">
							{#if sel?.marquee === true && contentWidth && contentWidth > 394 && !$editMode}
								{#await import('$lib/Components/Marquee.svelte')}
									loading
								{:then Marquee}
									<svelte:component this={Marquee.default}>
										<!-- snippet -->
										{#if entity_data?.title}
											{entity_data?.title}

											{#if entity_data?.aired}
												({entity_data?.aired?.split('-')?.[0]})
											{/if}
										{:else}
											<StateLogic entity_id={sel?.entity_id} selected={sel} />
										{/if}
										{@html '&nbsp;'.repeat(4)}
									</svelte:component>
								{/await}
							{:else}
								<!-- snippet -->

								{#if entity_data?.title}
									{entity_data?.title}

									{#if entity_data?.aired}
										({entity_data?.aired?.split('-')?.[0]})
									{/if}
								{:else}
									<StateLogic entity_id={sel?.entity_id} selected={sel} />
								{/if}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.measure {
		visibility: hidden;
		width: min-content;
		position: absolute;
	}

	.icon-state {
		position: absolute;
		filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.15));
		z-index: 1;
	}

	.overlay-icon {
		display: flex;
		justify-content: center;
		align-items: end;
		position: absolute;
		top: 65%;
		left: 50%;
		z-index: 1;
	}

	.progress {
		position: absolute;
		filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.15));
		top: 0.8rem;
		right: 0.8rem;
	}

	.container {
		display: grid;
		overflow: hidden;
		--container-padding: 0.8rem;
		position: relative;
		color: white;
		border-radius: 0.65rem;
		background-color: var(--theme-button-background-color-off);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		text-shadow: rgba(0, 0, 0, 0.15) 1px 1px 1px;
	}

	.name {
		grid-area: name;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.95rem;
		margin-top: -1px;
		color: var(--theme-button-name-color-off);
	}

	.state {
		grid-area: state;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.925rem;
		margin-top: 1px;
		color: rgba(255, 255, 255, 0.85);
	}

	.icon {
		--icon-size: 2.4rem;
		grid-area: icon;
		height: var(--icon-size);
		width: var(--icon-size);
		color: rgb(200 200 200);
		background-color: rgba(0, 0, 0, 0.25);
		border-radius: 50%;
		display: grid;
		align-items: center;
		display: flex;
		padding: 0.5rem;
		background-position: center center;
		background-size: cover;
		background-repeat: no-repeat;
	}

	.left {
		display: inherit;
		padding: var(--container-padding);
	}

	.right {
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		padding-right: var(--container-padding);
	}

	.background {
		height: 65px;
		align-self: end;
		display: grid;
		grid-template-columns: min-content auto;
		grid-auto-flow: row;
		grid-template-areas: 'left right';
		border-radius: 0 0 0.65rem 0.65rem;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		.container {
			width: calc(100vw - (1.25rem + 1.25rem));
		}
	}
</style>
