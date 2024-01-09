<script lang="ts">
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import {
		connection,
		editMode,
		itemHeight,
		lang,
		motion,
		onStates,
		ripple,
		states
	} from '$lib/Stores';
	import type { ButtonItem } from '$lib/Types';
	import { getDomain, getName } from '$lib/Utils';
	import Icon from '@iconify/svelte';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';

	export let demo: string | undefined = undefined;
	export let sel: ButtonItem;

	$: entity_id = demo || sel?.entity_id;
	$: name = sel?.name;
	$: icon = sel?.icon;
	$: color = sel?.color;
	$: size = sel?.size;
	$: marquee = sel?.marquee;
	$: more_info = sel?.more_info;

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
	 * using the correct service call...
	 */
	function toggle() {
		const domain = getDomain(entity_id);
		const state = entity?.state;
		if (!domain || !state) return;

		const services: Record<string, string> = {
			automation: 'toggle',
			button: 'press',
			cover: 'toggle',
			fan: 'toggle',
			humidifier: 'toggle',
			input_boolean: 'toggle',
			input_button: 'press',
			light: 'toggle',
			lock: state === 'locked' ? 'unlock' : 'lock',
			media_player: 'toggle',
			scene: 'turn_on',
			script: 'toggle',
			siren: 'toggle',
			switch: 'toggle',
			timer: state === 'active' ? 'pause' : 'start',
			vacuum: 'toggle'
		};

		switch (domain) {
			case 'person':
				console.debug('ping phone?');
				break;

			case 'remote':
				callService($connection, 'homeassistant', 'toggle', { entity_id });
				break;

			default:
				if (domain in services) {
					callService($connection, domain, services[domain], { entity_id });

					// loader
					delayLoading = setTimeout(() => {
						loading = true;
					}, $motion);

					// loader 20s fallback
					resetLoading = setTimeout(() => {
						loading = false;
					}, 20_000);
				} else {
					// not listed above just open modal
					handleClickEvent();
				}
		}
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
				demo: entity_id,
				sel
			});
		} else if (more_info === false) {
			toggle();
		} else {
			switch (getDomain(sel?.entity_id)) {
				// light
				case 'light':
					openModal(() => import('$lib/Modal/LightModal.svelte'), {
						sel: sel
					});
					break;

				// switch
				case 'automation':
				case 'input_boolean':
				case 'remote':
				case 'siren':
				case 'switch':
				case 'script':
					openModal(() => import('$lib/Modal/SwitchModal.svelte'), { sel });
					break;

				// sensor
				case 'air_quality':
				case 'calendar':
				case 'date':
				case 'time':
				case 'event':
				case 'image_processing':
				case 'mailbox':
				case 'sensor':
				case 'binary_sensor':
				case 'stt':
				case 'update':
				case 'weather':
				case 'button':
				case 'scene':
				case 'schedule':
				case 'sun':
				case 'input_button':
					openModal(() => import('$lib/Modal/SensorModal.svelte'), { sel });
					break;

				// number
				case 'input_number':
				case 'number':
					openModal(() => import('$lib/Modal/InputNumberModal.svelte'), { sel });
					break;

				// date
				case 'input_datetime':
				case 'datetime':
					openModal(() => import('$lib/Modal/InputDateModal.svelte'), { sel });
					break;

				// select
				case 'input_select':
				case 'select':
					openModal(() => import('$lib/Modal/InputSelectModal.svelte'), { sel });
					break;

				// text
				case 'input_text':
				case 'text':
					openModal(() => import('$lib/Modal/InputTextModal.svelte'), { sel });
					break;

				case 'timer':
					openModal(() => import('$lib/Modal/TimerModal.svelte'), { sel });
					break;

				case 'counter':
					openModal(() => import('$lib/Modal/CounterModal.svelte'), { sel });
					break;

				case 'alarm_control_panel':
					openModal(() => import('$lib/Modal/AlarmControlPanelModal.svelte'), {
						sel
					});
					break;

				case 'lock':
					openModal(() => import('$lib/Modal/LockModal.svelte'), { sel });
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
					const entity = $states?.[sel?.entity_id!];
					const attributes = entity?.attributes;
					const entity_picture = attributes?.entity_picture;

					// if attributes?.source_type === 'gps'
					openModal(() => import('$lib/Modal/MapModal.svelte'), {
						entity_id: entity?.entity_id,
						entity_picture: entity_picture
					});
					break;
				}
				case 'person': {
					const device_trackers = $states?.[sel?.entity_id!]?.attributes?.device_trackers || [];
					const gpsEntities = Object.values($states).filter(
						(states) =>
							device_trackers.includes(states.entity_id) && states.attributes?.source_type === 'gps'
					);

					if (!gpsEntities.length) return;
					const entity_id = gpsEntities[0]?.entity_id;

					openModal(async () => import('$lib/Modal/MapModal.svelte'), {
						entity_id,
						entity_picture: $states?.[sel?.entity_id!]?.attributes?.entity_picture
					});

					break;
				}
				case 'cover':
					openModal(() => import('$lib/Modal/CoverModal.svelte'), {
						selected: sel
					});
					break;
				case 'fan':
					openModal(() => import('$lib/Modal/FanModal.svelte'), {
						selected: sel
					});
					break;
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

	function getItemStyles(sel: ButtonItem) {
		return `
			cursor: ${$editMode ? 'pointer' : ''};
			grid-template-columns: ${sel.size === 'small' ? '' : 'min-content auto'};
			grid-template-areas: 
				${
					sel.size === 'small'
						? `
							'icon  circle'
							'right right'
						`
						: `
							'left right'
						`
				};
		`;
	}

	function getRightStyles(sel: ButtonItem) {
		return `
			justify-content: ${sel.size === 'small' ? 'end' : 'center'};
		`;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
	class="container"
	bind:this={container}
	data-state={stateOn}
	tabindex="-1"
	style={getItemStyles(sel)}
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
				<img src="loader.svg" alt="loading" style="margin:0 auto" />
			{:else if image}
				&nbsp;
			{:else if icon}
				<Icon {icon} height="auto" width="100%" />
			{:else if entity_id}
				<ComputeIcon {entity_id} />
			{:else}
				<Icon icon="ooui:help-ltr" height="auto" width="100%" />
			{/if}
		</div>
	</div>

	<div class="right" on:click|stopPropagation={handleEvent} style={getRightStyles(sel)}>
		<!-- NAME -->
		<div class="name" data-state={stateOn}>
			{getName({ name }, entity) || $lang('unknown')}
		</div>

		<!-- STATE -->

		<!-- only bind clientWidth if marquee is set and use svelte-fast-dimension -->
		<div class="state" data-state={stateOn}>
			{#if marquee}
				<div style="width: min-content;" bind:clientWidth={contentWidth}>
					<StateLogic {entity_id} selected={sel} {contentWidth} />
				</div>
			{:else}
				<div style="overflow: hidden; text-overflow: ellipsis;">
					<StateLogic {entity_id} selected={sel} {contentWidth} />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		background-color: var(--theme-button-background-color-off);
		font-family: inherit;
		display: grid;
		border-radius: 0.65rem;
		height: 100%;
		grid-auto-flow: row;
		grid-template-areas: 'left right';
		--container-padding: 0.7rem;

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
		display: flex;
		align-items: center;
	}

	.right {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		gap: 1px;
		grid-area: right;
		padding: var(--container-padding);
	}

	.icon {
		--icon-size: 2.5rem;
		height: var(--icon-size);
		width: var(--icon-size);
		color: rgb(200 200 200);
		background-color: rgba(0, 0, 0, 0.25);
		border-radius: 50%;
		display: grid;
		align-items: center;
	}

	.name {
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		color: var(--theme-button-name-color-off);
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--sidebar-font-size);
	}

	.state {
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

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		.name {
			font-size: 0.85rem;
		}
		.state {
			font-size: calc(var(--theme-drawer-font-size) - 0.2rem);
		}
		.container {
			--container-padding: 0.6rem;
		}
	}
</style>
