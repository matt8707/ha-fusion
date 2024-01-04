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
	import { getName, getSupport } from '$lib/Utils';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';

	export let isOpen: boolean;
	export let selected: any;

	// https://github.com/home-assistant/frontend/blob/dev/src/data/cover.ts
	const enum Feature {
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
	$: attributes = entity?.attributes;

	// position
	$: position = attributes?.current_position;
	$: supportsOpen = getSupport(attributes, Feature.OPEN);
	$: supportsStop = getSupport(attributes, Feature.STOP);
	$: supportsClose = getSupport(attributes, Feature.CLOSE);
	$: supportsSetPosition = getSupport(attributes, Feature.SET_POSITION);

	// tilt
	$: tiltPosition = attributes?.current_tilt_position;
	$: supportsOpenTilt = getSupport(attributes, Feature.OPEN_TILT);
	$: supportsCloseTilt = getSupport(attributes, Feature.CLOSE_TILT);
	$: supportsStopTilt = getSupport(attributes, Feature.STOP_TILT);
	$: supportsSetTiltPosition = getSupport(attributes, Feature.SET_TILT_POSITION);

	$: canCoverOpen = canOpen(entity);
	$: canCoverStop = canStop(entity);
	$: canCoverClose = canClose(entity);

	async function handleChange(service: string, attribute: string, position: number) {
		if (request) return;

		request = callService($connection, 'cover', service, {
			entity_id: entity?.entity_id,
			[attribute]: position
		});

		try {
			await request;
		} catch (error) {
			console.error(`Failed to set cover ${attribute}:`, error);
		} finally {
			request = undefined;
		}
	}

	function handleClick(service: string) {
		callService($connection, 'cover', service, {
			entity_id: entity?.entity_id
		});
	}

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
				{$lang('position')}

				<span class="align-right">
					{#if position === 0}
						{$lang('closed')}
					{:else}
						{$lang('open')}
						{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(position / 100)}
					{/if}
				</span>
			</h2>

			<RangeSlider
				value={position}
				min={0}
				max={100}
				on:change={(event) => {
					request = undefined;
					handleChange('set_cover_position', 'position', Math.round(event?.detail));
				}}
			/>
		{/if}

		<!-- POSITION BUTTONS -->

		{#if supportsClose || supportsStop || supportsOpen}
			<h2>{$lang('buttons')}</h2>
		{/if}

		<div class="buttons-container">
			{#if supportsClose}
				<button
					use:Ripple={$ripple}
					on:click={() => handleClick('close_cover')}
					disabled={!canCoverClose}
					title={$lang('close_cover')}
				>
					<Icon icon="raphael:arrowdown" height="none" />
				</button>
			{/if}

			{#if supportsStop}
				<button
					on:click={() => handleClick('stop_cover')}
					use:Ripple={$ripple}
					disabled={!canCoverStop}
					title={$lang('stop_cover')}
				>
					<Icon icon="ic:round-stop" height="none" />
				</button>
			{/if}

			{#if supportsOpen}
				<button
					on:click={() => handleClick('open_cover')}
					use:Ripple={$ripple}
					disabled={!canCoverOpen}
					title={$lang('open_cover')}
				>
					<Icon icon="raphael:arrowup" height="none" />
				</button>
			{/if}
		</div>

		<!-- TILT POSITION -->
		{#if supportsSetTiltPosition && tiltPosition !== undefined}
			<h2>
				{$lang('tilt_position')}

				<span class="align-right">
					{#if tiltPosition === 0}
						{$lang('closed')}
					{:else}
						{$lang('open')}
						{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(tiltPosition / 100)}
					{/if}
				</span>
			</h2>

			<RangeSlider
				value={tiltPosition}
				min={0}
				max={100}
				on:change={(event) => {
					request = undefined;
					handleChange('set_cover_tilt_position', 'tilt_position', Math.round(event?.detail));
				}}
			/>
		{/if}

		{#if supportsCloseTilt || supportsStopTilt || supportsOpenTilt}
			<h2>{$lang('buttons')}</h2>
		{/if}

		<!-- TILT BUTTONS -->
		<div class="buttons-container">
			{#if supportsCloseTilt}
				<button
					on:click={() => handleClick('close_cover_tilt')}
					use:Ripple={$ripple}
					title={$lang('close_tilt_cover')}
				>
					<Icon icon="raphael:arrowdown" height="none" />
				</button>
			{/if}

			{#if supportsStopTilt}
				<button
					on:click={() => handleClick('stop_cover_tilt')}
					use:Ripple={$ripple}
					title={$lang('stop_cover')}
				>
					<Icon icon="ic:round-stop" height="none" />
				</button>
			{/if}

			{#if supportsOpenTilt}
				<button
					on:click={() => handleClick('open_cover_tilt')}
					use:Ripple={$ripple}
					title={$lang('open_tilt_cover')}
				>
					<Icon icon="raphael:arrowup" height="none" />
				</button>
			{/if}
		</div>

		<ConfigButtons />
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
