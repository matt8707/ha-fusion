<script lang="ts">
	import { states, itemHeight, lang, configuration } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import { getName } from '$lib/Utils';

	export let sel: any;

	let backgroundImage: string;

	/**
	 * Most recently changed media_player that is playing
	 */
	$: entity =
		$states &&
		Object.entries($states)
			.filter(
				([key, value]) =>
					key.startsWith('media_player.') &&
					sel?.conditional?.map((item: { entity_id: string }) => item.entity_id).includes(key) &&
					value.state === 'playing'
			)
			.sort(
				([, a], [, b]) => new Date(b.last_changed).getTime() - new Date(a.last_changed).getTime()
			)
			.map(([, entity]) => entity)?.[0];

	/**
	 * Get sensor entity
	 */
	$: sensor =
		$states?.[
			sel?.conditional
				?.map((item: { entity_id: string }) => item.entity_id)
				.find((entity_id: string) => entity_id.startsWith('sensor.'))
		];

	$: sel_media_player = sel?.conditional?.find(
		(item: { entity_id: string }) => item.entity_id === entity?.entity_id
	);

	$: sel_sensor = sel?.conditional?.find((entity: { entity_id: string }) =>
		entity?.entity_id?.startsWith('sensor.')
	);

	/**
	 * Get icon for entity or sensor
	 */
	$: entityIcon = sel_media_player?.icon || entity?.attributes?.icon;
	$: sensorIcon = sel_sensor?.icon || sensor?.attributes?.icon;

	$: name =
		sel_media_player?.name ||
		getName(undefined, entity) ||
		sel_sensor?.name ||
		getName(undefined, sensor);

	/**
	 * Get youtube addon
	 */
	$: youtube_watching =
		$configuration?.addons?.youtube_watching?.entity_id &&
		$states?.[$configuration?.addons?.youtube_watching?.entity_id];

	/**
	 * Handle background-image
	 */
	$: if (
		youtube_watching &&
		entity?.attributes?.app_id === 'com.google.ios.youtube' &&
		entity?.attributes?.media_artist === youtube_watching?.attributes?.channel &&
		entity?.attributes?.media_title === youtube_watching?.attributes?.title
	) {
		backgroundImage = `url(${youtube_watching?.state?.replace('https://img.youtube.com', '')})`;
	} else if (entity && entity?.attributes?.entity_picture) {
		backgroundImage = `url("${entity?.attributes?.entity_picture}")`;
	} else if (!entity && sensor) {
		backgroundImage = `url("${sensor?.attributes?.data?.[1]?.fanart}"), url("${sensor?.attributes?.data?.[1]?.poster}")`;
	} else {
		backgroundImage = 'none';
	}
</script>

<div
	class="media-container"
	style:background-image={backgroundImage}
	style:height="calc({$itemHeight}px * 4 + 0.4rem * 3)"
>
	{#if entity?.attributes?.app_id === 'com.google.ios.youtube' && backgroundImage === 'none'}
		<div class="youtube-icon">
			<Icon icon="logos:youtube-icon" height="auto" width="100%" />
		</div>
	{/if}
	<div
		class="test"
		style:background-color={backgroundImage === 'none' ? 'none' : 'rgba(0, 0, 0, 0.25)'}
		style:backdrop-filter={backgroundImage === 'none' ? 'none' : 'blur(1rem)'}
		style:-webkit-backdrop-filter={backgroundImage === 'none' ? 'none' : 'blur(1rem)'}
	>
		<div class="left">
			<div class="icon">
				{#if entityIcon}
					<Icon icon={entityIcon} height="auto" width="100%" />
				{:else if entity?.entity_id}
					<ComputeIcon entity_id={entity?.entity_id} />
				{:else if sensorIcon}
					<Icon icon={sensorIcon} height="auto" width="100%" />
				{:else if sensor?.entity_id}
					<ComputeIcon entity_id={sensor?.entity_id} />
				{:else}
					<Icon icon="ooui:help-ltr" height="auto" width="100%" />
				{/if}
			</div>
		</div>

		<div class="right">
			{#if !entity && sensor}
				<div class="name">
					{name || $lang('unknown')}
				</div>

				<div class="state">
					<div style="overflow: hidden; text-overflow: ellipsis;">
						{sensor?.attributes?.data?.[1]?.title}

						{#if sensor?.attributes?.data?.[1]?.aired}
							({sensor?.attributes?.data?.[1]?.aired?.split('-')?.[0]})
						{/if}
					</div>
				</div>
			{:else}
				{@const media_artist = entity?.attributes?.media_artist}
				{@const media_title = entity?.attributes?.media_title}

				<div class="name">
					{name || $lang('unknown')}
				</div>

				<div class="state">
					<div style="overflow: hidden; text-overflow: ellipsis;">
						{#if media_artist && media_title}
							<!-- ARTIST - TITLE -->

							{media_artist} - {media_title}
						{:else if media_artist && !media_title}
							<!-- ARTIST -->

							{media_artist}
						{:else if !media_artist && media_title}
							<!-- TITLE -->

							{media_title}
						{:else}
							{$lang('unknown')}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.youtube-icon {
		width: 20%;
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.name {
		grid-area: name;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--sidebar-font-size);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
	}

	.state {
		grid-area: state;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--theme-drawer-font-size);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
	}

	.icon {
		--icon-size: 2.5rem;
		grid-area: icon;
		height: var(--icon-size);
		width: var(--icon-size);
		justify-self: center;
		align-self: center;
		color: rgb(200 200 200);
		background-color: rgba(0, 0, 0, 0.25);
		padding: 0.5rem;
		border-radius: 50%;
	}

	.left {
		padding: var(--container-padding);
	}

	.right {
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		gap: 1px;
		margin-top: -1px;
		color: white;
	}

	.test {
		height: 65px;
		align-self: end;
		display: grid;
		grid-template-columns: min-content auto;
		grid-auto-flow: row;
		grid-template-areas: 'left right';
		border-radius: 0 0 0.65rem 0.65rem;
	}

	.media-container {
		display: grid;
		overflow: hidden;
		--container-padding: 0.8rem;
		position: relative;
		color: white;
		width: calc(14.5rem * 2 + 0.4rem);
		border-radius: 0.65rem;
		background-color: var(--theme-button-background-color-off);
		background-size: cover;
		background-repeat: no-repeat;
	}
</style>
