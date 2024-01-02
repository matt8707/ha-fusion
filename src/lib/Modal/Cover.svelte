<script lang="ts">
	import { states, connection, lang, ripple, selectedLanguage } from '$lib/Stores';
	import {
		callService,
		type HassEntity,
		type HassEntityAttributeBase
	} from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Icon from '@iconify/svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName, supportsFeatureFromAttributes } from '$lib/Utils';

	export let isOpen: boolean;
	export let selected: any;

	// Taken from https://github.com/home-assistant/frontend/blob/dev/src/data/cover.ts
	const enum CoverEntityFeature {
		OPEN = 1,
		CLOSE = 2,
		SET_POSITION = 4,
		STOP = 8,
		OPEN_TILT = 16,
		CLOSE_TILT = 32,
		STOP_TILT = 64,
		SET_TILT_POSITION = 128
	}

	interface CoverEntityAttributes extends HassEntityAttributeBase {
		current_position?: number;
		current_tilt_position?: number;
	}

	interface CoverEntity extends HassEntity {
		state: string;
		attributes: CoverEntityAttributes;
	}

	let request: Promise<unknown> | undefined = undefined;

	$: entity = $states[selected?.entity_id] as CoverEntity;
	$: position = entity?.attributes?.current_position;
	$: supportsOpen = supportsFeatureFromAttributes(entity?.attributes, CoverEntityFeature.OPEN);
	$: supportsStop = supportsFeatureFromAttributes(entity?.attributes, CoverEntityFeature.STOP);
	$: supportsClose = supportsFeatureFromAttributes(entity?.attributes, CoverEntityFeature.CLOSE);
	$: supportsSetPosition = supportsFeatureFromAttributes(
		entity?.attributes,
		CoverEntityFeature.SET_POSITION
	);
	$: canCoverOpen = canOpen(entity);
	$: canCoverStop = canStop(entity);
	$: canCoverClose = canClose(entity);

	async function handleChange(position: number) {
		if (request) return;

		request = callService($connection, 'cover', 'set_cover_position', {
			entity_id: entity?.entity_id,
			position
		});

		try {
			await request;
		} catch (error) {
			console.error('Failed to set cover position:', error);
		} finally {
			request = undefined;
		}
	}

	async function handleClick(service: string) {
		await callService($connection, 'cover', service, {
			entity_id: entity?.entity_id
		});
	}

	// Adapted from https://github.com/home-assistant/frontend/blob/dev/src/data/cover.ts
	function canOpen(entity: CoverEntity) {
		if (entity.state === 'unavailable') {
			return false;
		}

		return entity.attributes.assumed_state === true || (!isFullyOpen(entity) && !isOpening(entity));
	}

	function canClose(entity: CoverEntity): boolean {
		if (entity.state === 'unavailable') {
			return false;
		}

		return (
			entity.attributes.assumed_state === true || (!isFullyClosed(entity) && !isClosing(entity))
		);
	}

	function canStop(entity: CoverEntity): boolean {
		return entity.state !== 'unavailable';
	}

	function isFullyOpen(entity: CoverEntity) {
		if (entity.attributes.current_position !== undefined) {
			return entity.attributes.current_position === 100;
		}

		return entity.state === 'open';
	}

	function isFullyClosed(entity: CoverEntity) {
		if (entity.attributes.current_position !== undefined) {
			return entity.attributes.current_position === 0;
		}

		return entity.state === 'closed';
	}

	function isOpening(entity: CoverEntity) {
		return entity.state === 'opening';
	}

	function isClosing(entity: CoverEntity) {
		return entity.state === 'closing';
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		<!-- POSITION -->
		{#if supportsSetPosition && position !== undefined}
			<h2>
				<!-- Translated label candidate: ui.dialogs.more_info_control.cover.switch_mode.position -->
				Position
				<span class="align-right">
					{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(position / 100)}
				</span>
			</h2>
			<RangeSlider
				value={position}
				min={0}
				max={100}
				reverse={true}
				on:change={(event) => {
					request = undefined;
					handleChange(Math.round(event.detail));
				}}
			/>
		{/if}

		<!-- BUTTONS -->
		<h2>
			<!-- Translated label candidate: ui.dialogs.more_info_control.cover.switch_mode.button -->
			Buttons
		</h2>
		<div class="buttons-container">
			<!-- Open -->
			<button
				on:click={() => handleClick('open_cover')}
				use:Ripple={$ripple}
				style:display={supportsOpen ? 'block' : 'none'}
				disabled={!canCoverOpen}
			>
				<Icon icon="raphael:arrowup" height="none" />
			</button>

			<!-- Stop -->
			<button
				on:click={() => handleClick('stop_cover')}
				use:Ripple={$ripple}
				style:display={supportsStop ? 'block' : 'none'}
				disabled={!canCoverStop}
			>
				<Icon icon="ic:round-stop" height="none" />
			</button>

			<!-- Close -->
			<button
				use:Ripple={$ripple}
				on:click={() => {
					handleClick('close_cover');
				}}
				style:display={supportsClose ? 'block' : 'none'}
				disabled={!canCoverClose}
			>
				<Icon icon="raphael:arrowdown" height="none" />
			</button>
		</div>
	</Modal>
{/if}

<style>
	.buttons-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 70%;
		margin: auto;
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

	button:disabled {
		opacity: 0.2;
	}
</style>
