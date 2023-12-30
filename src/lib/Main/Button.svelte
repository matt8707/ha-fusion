<script lang="ts">
	import {
		states,
		editMode,
		connection,
		onStates,
		motion,
		ripple,
		lang,
		itemHeight
	} from '$lib/Stores';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import Icon from '@iconify/svelte';
	import { getDomain, getName } from '$lib/Utils';

	export let entity_id: string | undefined;
	export let name: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let color: string | undefined = undefined;
	export let marquee: boolean | undefined = undefined;
	export let config: any;
	export let sel: any;

	let entity: HassEntity;
	let contentWidth: number;
	let container: HTMLDivElement;
	let loading: boolean;
	let resetLoading: ReturnType<typeof setTimeout> | null;

	/** display loader if no state change has occurred within `$motion`ms */
	let delayLoading: ReturnType<typeof setTimeout> | null;

	/**
	 * Observes changes in the `last_updated` property of an entity.
	 * When the `last_updated` property changes:
	 *
	 * - Updates `entity` with the new state from `$states`
	 * - Resets the `loading` state to `false`
	 * - Clears any pending loading or reset timeouts
	 */
	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[entity_id];

		loading = false;

		if (delayLoading) {
			clearTimeout(delayLoading);
			delayLoading = null;
		}

		if (resetLoading) {
			clearTimeout(resetLoading);
			resetLoading = null;
		}
	}

	$: attributes = entity?.attributes;

	$: iconColor = color
		? color
		: attributes?.hs_color
			? `hsl(${attributes?.hs_color}%, 50%)`
			: 'rgb(75, 166, 237)';

	// icon is image if extension, e.g. test.png
	$: image = icon?.includes('.');

	$: stateOn = $onStates?.includes(entity?.state);

	/**
	 * Toggles the state of the specified entity
	 * using the `homeassistant.toggle` service
	 */
	function toggle() {
		const domain = getDomain(sel?.entity_id);

		if (domain === 'timer') {
			const service = entity?.state === 'active' ? 'pause' : 'start';
			callService($connection, 'timer', service, {
				entity_id: entity?.entity_id
			});
		} else if (domain === 'person') {
			console.debug('shortcut to ping iphone?');
			return;
		} else {
			callService($connection, 'homeassistant', 'toggle', {
				entity_id: entity?.entity_id
			});
		}

		delayLoading = setTimeout(() => {
			loading = true;
		}, $motion);

		// remove loader after 20s if state never changes (fallback)
		resetLoading = setTimeout(() => {
			loading = false;
		}, 20_000);
	}

	/**
	 * Delegate to handleEvent
	 */
	function handlePointer() {
		handleEvent({ type: 'preload' });
	}

	/**
	 * handleEvent
	 * pointerenter | pointerdown | click
	 */
	async function handleEvent(event: any) {
		if (event.type === 'click') {
			await handleClickEvent();
		} else {
			await handlePointerEvent();
		}
	}

	/**
	 * Handle click events
	 * Opens modal for specified domain
	 */
	async function handleClickEvent() {
		if ($editMode) {
			openModal(() => import('$lib/Modal/ButtonConfig.svelte'), {
				sel,
				config: config
			});
		} else {
			switch (getDomain(sel?.entity_id)) {
				case 'light':
					openModal(() => import('$lib/Modal/LightModal.svelte'), {
						sel: sel
					});
					break;
				case 'switch':
					openModal(() => import('$lib/Modal/SwitchModal.svelte'), {
						selected: sel
					});
					break;
				case 'timer':
					openModal(() => import('$lib/Modal/TimerModal.svelte'), { entity_id });
					break;
				case 'climate':
					openModal(() => import('$lib/Modal/ClimateModal.svelte'), {
						selected: sel
					});
					break;
				case 'camera':
					openModal(() => import('$lib/Modal/CameraModal.svelte'), {
						entity_id: sel?.entity_id
					});
					break;
				case 'media_player':
					openModal(() => import('$lib/Modal/MediaPlayer.svelte'), {
						selected: sel
					});
					break;
				case 'device_tracker': {
					const entity = $states?.[sel?.entity_id];
					const attributes = entity?.attributes;
					const entity_picture = attributes?.entity_picture;

					// if attributes?.source_type === 'gps'
					openModal(() => import('$lib/Modal/MapModal.svelte'), {
						entity_id: entity?.entity_id,
						config,
						entity_picture: entity_picture
					});
					break;
				}
				case 'person': {
					const device_trackers = $states?.[sel?.entity_id]?.attributes?.device_trackers || [];
					const gpsEntities = Object.values($states).filter(
						(states) =>
							device_trackers.includes(states.entity_id) && states.attributes?.source_type === 'gps'
					);

					if (!gpsEntities.length) return;
					const entity_id = gpsEntities[0]?.entity_id;

					openModal(async () => import('$lib/Modal/MapModal.svelte'), {
						entity_id,
						config,
						entity_picture: $states?.[sel?.entity_id]?.attributes?.entity_picture
					});

					break;
				}
				default:
					openModal(() => import('$lib/Modal/Unknown.svelte'), {
						selected: sel
					});
					break;
			}
		}
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointerEvent() {
		let module;

		if ($editMode) {
			module = await import('$lib/Modal/ButtonConfig.svelte');
		} else {
			switch (getDomain(sel?.entity_id)) {
				case 'light':
					module = await import('$lib/Modal/LightModal.svelte');
					break;
				case 'switch':
					module = await import('$lib/Modal/SwitchModal.svelte');
					break;
				case 'climate':
					module = await import('$lib/Modal/ClimateModal.svelte');
					break;
				case 'media_player':
					module = await import('$lib/Modal/MediaPlayer.svelte');
					break;
				case 'person':
					module = await import('$lib/Modal/MapModal.svelte');
					break;
				default:
					module = await import('$lib/Modal/Unknown.svelte');
					break;
			}
		}
		if (module) module.default;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
	class="container"
	bind:this={container}
	data-state={stateOn}
	tabindex="-1"
	style={!$editMode ? 'cursor: pointer;' : ''}
	style:height="{$itemHeight}px"
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	use:Ripple={{
		...$ripple,
		color: !$editMode
			? stateOn
				? 'rgba(0, 0, 0, 0.25)'
				: 'rgba(255, 255, 255, 0.15)'
			: 'rgba(0, 0, 0, 0)'
	}}
>
	<!-- ICON -->

	<div
		class="left"
		on:click|stopPropagation={(event) => {
			if (!$editMode) {
				toggle();
			} else {
				handleEvent(event);
			}
		}}
	>
		<!-- rerender if `icon-entity_id` changes -->

		<div
			class="icon"
			data-state={stateOn}
			style:--icon-color={iconColor}
			style:background-image={image ? `url(${icon})` : 'none'}
			class:image
		>
			{#if loading}
				<img src="loader.svg" alt="loading" />
			{:else if image}
				&nbsp;
			{:else if icon}
				<Icon {icon} height="auto" width="100%" style="margin:0 auto" />
			{:else if entity_id}
				<ComputeIcon {entity_id} />
			{:else}
				<Icon icon="ooui:help-ltr" height="auto" width="100%" />
			{/if}
		</div>
	</div>

	<div class="right" on:click|stopPropagation={handleEvent}>
		<!-- NAME -->
		<div class="name" data-state={stateOn}>
			{getName({ name }, entity) || $lang('unknown')}
		</div>

		<!-- STATE -->

		<!-- only bind clientWidth if marquee is set and use svelte-fast-dimension -->
		{#key sel}
			<div class="state" data-state={stateOn}>
				{#if marquee}
					<div style="width: min-content;" bind:clientWidth={contentWidth}>
						<StateLogic selected={sel} {contentWidth} />
					</div>
				{:else}
					<div style="overflow: hidden; text-overflow: ellipsis;">
						<StateLogic selected={sel} {contentWidth} />
					</div>
				{/if}
			</div>
		{/key}
	</div>
</div>

<style>
	.container {
		background-color: var(--theme-button-background-color-off);
		font-family: inherit;
		width: 14.5rem;
		display: grid;
		border-radius: 0.65rem;
		margin: 0;
		grid-template-columns: min-content auto;
		grid-auto-flow: row;
		grid-template-areas: 'left right';
		--container-padding: 0.8rem;

		/* fix ripple */
		transform: translateZ(0);
		overflow: hidden;
	}

	.image {
		background-size: cover;
		background-repeat: no-repeat;
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
	}

	.icon {
		--icon-size: 2.5rem;
		grid-area: icon;
		height: var(--icon-size);
		width: var(--icon-size);
		color: rgb(200 200 200);
		background-color: rgba(0, 0, 0, 0.25);
		border-radius: 50%;
		display: grid;
		align-items: center;
	}

	.name {
		grid-area: name;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		color: var(--theme-button-name-color-off);
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--sidebar-font-size);
	}

	.state {
		grid-area: state;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--theme-button-state-color-off);
		font-size: var(--theme-drawer-font-size);
	}

	.container[data-state='true'] {
		background-color: var(--theme-button-background-color-on);
		color: black;
	}

	.icon[data-state='true'] {
		color: white;
		background-color: var(--icon-color);
	}

	.name[data-state='true'] {
		color: var(--theme-button-name-color-on);
	}

	.state[data-state='true'] {
		color: var(--theme-button-state-color-on);
	}
</style>
