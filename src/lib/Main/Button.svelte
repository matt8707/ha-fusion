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
		climateHvacActionToMode,
		ripple,
		states,
		templates,
		config,
		selectedLanguage,
		calendarView,
		calendarFirstDay
	} from '$lib/Stores';
	import { getDomain, getName, getTogglableService } from '$lib/Utils';
	import Icon, { loadIcon } from '@iconify/svelte';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import { marked } from 'marked';
	import { onDestroy } from 'svelte';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import parser from 'js-yaml';

	export let demo: string | undefined = undefined;
	export let sel: any;
	export let sectionName: string | undefined = undefined;

	$: entity_id = demo || sel?.entity_id;
	$: template = $templates?.[sel?.id];
	$: icon = (sel?.template?.icon && template?.icon?.output) || sel?.icon;
	$: color = (sel?.template?.color && template?.color?.output) || sel?.color;
	$: marquee = sel?.marquee;
	$: more_info = sel?.more_info;

	let entity: HassEntity;
	let contentWidth: number;
	let container: HTMLDivElement;
	let loading: boolean;
	let resetLoading: ReturnType<typeof setTimeout> | null;
	let stateOn: boolean;

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

	$: if (sel?.template?.set_state && template?.set_state?.output) {
		// template
		stateOn = $onStates?.includes(template?.set_state?.output?.toLocaleLowerCase());
	} else if (attributes?.hvac_action) {
		// climate
		stateOn = $onStates?.includes(
			$climateHvacActionToMode?.[attributes?.hvac_action]?.toLocaleLowerCase()
		);
	} else if (attributes?.in_progress) {
		// update
		stateOn = typeof attributes.in_progress === 'number';
	} else {
		// default
		stateOn = $onStates?.includes(entity?.state?.toLocaleLowerCase());
	}

	/**
	 * Toggles the state of the specified entity
	 * using the correct service call...
	 */
	function toggle() {
		// if service template
		if (sel?.template?.service && template?.service?.output) {
			try {
				// template is string, try to parse it
				const _template = parser.load(template?.service?.output) as {
					service: string;
					data: Record<string, string | number | boolean>;
				};

				if (_template?.service) {
					const [domain, service] = _template.service.split('.');
					callService($connection, domain, service, _template?.data);
				}
			} catch (error) {
				console.error('Template service YAML parse error:', error);
			}

			return;
		}

		// default
		const service = getTogglableService(entity);

		if (service) {
			// use returned domain to handle specific cases such
			// as 'remote', which uses 'homeassistant.toggle'
			const [_domain, _service] = service.split('.');
			callService($connection, _domain, _service, {
				entity_id
			});

			// loader
			delayLoading = setTimeout(() => {
				loading = true;
			}, $motion);

			// loader 20s fallback
			resetLoading = setTimeout(() => {
				loading = false;
			}, 20_000);
		} else {
			// not in getTogglableService just open modal
			handleClickEvent();
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
				sel,
				sectionName
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
				case 'input_boolean':
				case 'remote':
				case 'siren':
				case 'switch':
					openModal(() => import('$lib/Modal/SwitchModal.svelte'), { sel });
					break;

				// script
				case 'script':
					openModal(() => import('$lib/Modal/ScriptModal.svelte'), { sel });
					break;

				// automation
				case 'automation':
					openModal(() => import('$lib/Modal/AutomationModal.svelte'), { sel });
					break;

				// calendar
				case 'calendar': {
					// set first day of week
					$calendarFirstDay =
						'weekInfo' in Intl.Locale.prototype
							? (new Intl.Locale($selectedLanguage) as any)?.weekInfo.firstDay
							: (await import('weekstart')).getWeekStartByLocale($selectedLanguage);

					// set calendar view type
					$calendarView = localStorage.getItem('calendar');

					openModal(() => import('$lib/Modal/CalendarModal.svelte'), { sel });
					break;
				}


				// button
				case 'button':
						callService($connection, 'button', 'press', {
								entity_id: sel?.entity_id
						});
						break;

				// sensor
				case 'air_quality':
				case 'date':
				case 'time':
				case 'event':
				case 'image_processing':
				case 'mailbox':
				case 'sensor':
				case 'binary_sensor':
				case 'stt':
				case 'weather':
				//case 'button':
				case 'scene':
				case 'schedule':
				case 'sun':
				case 'person':
				case 'zone':
				case 'input_button':
					openModal(() => import('$lib/Modal/SensorModal.svelte'), { sel });
					break;

				// update
				case 'update':
					openModal(() => import('$lib/Modal/UpdateModal.svelte'), { sel });
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

				case 'vacuum':
					openModal(() => import('$lib/Modal/VacuumModal.svelte'), { sel });
					break;

				case 'lawn_mower':
					openModal(() => import('$lib/Modal/LawnMowerModal.svelte'), { sel });
					break;

				case 'valve':
					openModal(() => import('$lib/Modal/ValveModal.svelte'), { sel });
					break;

				case 'image':
					openModal(() => import('$lib/Modal/ImageModal.svelte'), { sel });
					break;

				case 'todo':
					openModal(() => import('$lib/Modal/TodoModal.svelte'), { sel });
					break;

				case 'counter':
					openModal(() => import('$lib/Modal/CounterModal.svelte'), { sel });
					break;

				case 'alarm_control_panel':
					openModal(() => import('$lib/Modal/AlarmControlPanelModal.svelte'), { sel });
					break;

				case 'lock':
					openModal(() => import('$lib/Modal/LockModal.svelte'), { sel });
					break;

				case 'climate':
					openModal(() => import('$lib/Modal/ClimateModal.svelte'), { sel });
					break;

				case 'camera':
					openModal(() => import('$lib/Modal/CameraModal.svelte'), { sel });
					break;

				case 'water_heater':
					openModal(() => import('$lib/Modal/WaterHeaterModal.svelte'), { sel });
					break;

				case 'humidifier':
					openModal(() => import('$lib/Modal/HumidifierModal.svelte'), { sel });
					break;

				case 'media_player':
					openModal(() => import('$lib/Modal/MediaPlayer.svelte'), {
						selected: sel
					});
					break;

				case 'group':
					openModal(() => import('$lib/Modal/GroupModal.svelte'), { sel });
					break;

				case 'device_tracker': {
					if ($states?.[sel?.entity_id]?.attributes?.source_type === 'gps') {
						openModal(() => import('$lib/Modal/DeviceTrackerModal.svelte'), { sel });
					} else {
						openModal(() => import('$lib/Modal/SensorModal.svelte'), { sel });
					}
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
		if ($editMode) {
			await import('$lib/Modal/ButtonConfig.svelte');
		} else {
			switch (getDomain(sel?.entity_id)) {
				case 'light':
					await import('$lib/Modal/LightModal.svelte');
					break;
				case 'switch':
					await import('$lib/Modal/SwitchModal.svelte');
					break;
				case 'climate':
					await import('$lib/Modal/ClimateModal.svelte');
					break;
				case 'media_player':
					await import('$lib/Modal/MediaPlayer.svelte');
					break;
				default:
					await import('$lib/Modal/Unknown.svelte');
					break;
			}
		}
	}

	////// templates //////

	$: if ($config?.state === 'RUNNING' && sel?.template) {
		// for each changed entry in template
		Object.entries(sel?.template as Record<string, string>).forEach(([key, value]) => {
			const compareTemplate = value === template?.[key]?.input;
			const compareEntityId = sel?.entity_id === template?.[key]?.entity_id;
			if (compareTemplate && compareEntityId) return;
			renderTemplate(key, value);
		});
	}

	let unsubscribe: () => void;

	async function renderTemplate(key: string, value: string) {
		if (!$connection || !sel?.id) return;

		try {
			unsubscribe = await $connection.subscribeMessage(
				(response: { result: string } | { error: string; level: 'ERROR' | 'WARNING' }) => {
					let data: any = {
						input: value
					};

					if ('result' in response) {
						data.output =
							key === 'state' || key === 'name'
								? marked.parseInline(String(response.result))
								: String(response.result);
					} else if (response?.level === 'ERROR') {
						console.error(response.error);
						data.error = response.error;
					}

					data.entity_id = sel?.entity_id;

					$templates[sel?.id] = { ...$templates[sel?.id], [key]: data };
				},
				{
					type: 'render_template',
					template: value,
					report_errors: true,
					variables: {
						entity_id: sel?.entity_id
					}
				}
			);
		} catch (error) {
			console.error('Template error:', error);
		}
	}

	onDestroy(() => unsubscribe?.());
</script>

<div
	class="container"
	bind:this={container}
	data-state={stateOn}
	tabindex="-1"
	style={!$editMode ? 'cursor: pointer;' : ''}
	style:min-height="{$itemHeight}px"
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
		on:keydown
		role="button"
		tabindex="0"
	>
		<div
			class="icon"
			data-state={stateOn}
			style:--icon-color={iconColor}
			style:background-color={sel?.template?.color && template?.color?.output
				? template?.color?.output
				: undefined}
			style:background-image={!icon && attributes?.entity_picture
				? `url(${attributes?.entity_picture})`
				: image && icon
					? `url(${icon})`
					: 'none'}
			class:image
		>
			{#if loading}
				<img src="loader.svg" alt="loading" style="margin:0 auto" />
			{:else if image || (!icon && attributes?.entity_picture)}
				&nbsp;
			{:else if icon}
				{#await loadIcon(icon)}
					<!-- loading -->
					<Icon icon="ooui:help-ltr" height="none" width="100%" />
				{:then resolvedIcon}
					<!-- exists -->
					<Icon icon={resolvedIcon} height="none" width="100%" />
				{:catch}
					<!-- doesn't exist -->
					<Icon icon="ooui:help-ltr" height="none" width="100%" />
				{/await}
			{:else if entity_id}
				<ComputeIcon {entity_id} />
			{:else}
				<Icon icon="ooui:help-ltr" height="none" width="100%" />
			{/if}
		</div>
	</div>

	<div class="right" on:click|stopPropagation={handleEvent} on:keydown role="button" tabindex="0">
		<!-- NAME -->
		<div class="name" data-state={stateOn}>
			{@html (sel?.template?.name && template?.name?.output) ||
				getName(sel, entity, sectionName) ||
				$lang('unknown')}
		</div>

		<!-- STATE -->

		<!-- only bind clientWidth if marquee is set and use svelte-fast-dimension -->
		<div class="state" data-state={stateOn}>
			{#if marquee}
				<div style="width: min-content;" bind:clientWidth={contentWidth}>
					{#if sel?.state || (sel?.template?.state && template?.state?.output)}
						{@html sel?.state || template?.state?.output}
					{:else if sel?.template?.set_state && template?.set_state?.output}
						{@html sel?.template?.set_state && $lang(template?.set_state?.output)}
					{:else}
						<StateLogic {entity_id} selected={sel} {contentWidth} />
					{/if}
				</div>
			{:else}
				<div style="overflow: hidden; text-overflow: ellipsis;">
					{#if sel?.state || (sel?.template?.state && template?.state?.output)}
						{@html sel?.state || template?.state?.output}
					{:else if sel?.template?.set_state && template?.set_state?.output}
						{@html sel?.template?.set_state && $lang(template?.set_state?.output)}
					{:else}
						<StateLogic {entity_id} selected={sel} {contentWidth} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		background-color: var(--theme-button-background-color-off);
		font-family: inherit;
		width: 100%;
		height: 100%;
		display: grid;
		border-radius: 0.65rem;
		margin: 0;
		grid-template-columns: min-content auto;
		grid-auto-flow: row;
		grid-template-areas: 'left right';
		--container-padding: 0.72rem;

		/* fix ripple */
		transform: translateZ(0);
		overflow: hidden;
	}

	.image {
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

	.name {
		grid-area: name;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		color: var(--theme-button-name-color-off);
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.95rem;
		margin-top: -1px;
	}

	.state {
		grid-area: state;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--theme-button-state-color-off);
		font-size: 0.925rem;
		margin-top: 1px;
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
		.container {
			width: calc(50vw - 1.45rem);
		}
	}
</style>
