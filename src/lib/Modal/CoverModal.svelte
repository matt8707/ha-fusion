<script lang="ts">
	import { states, connection, lang, ripple, selectedLanguage } from '$lib/Stores';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Icon from '@iconify/svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';

	export let isOpen: boolean;
	export let selected: any;

	let request: Promise<unknown> | undefined = undefined;

	$: entity = $states[selected?.entity_id] as HassEntity;
	$: attributes = entity?.attributes;

	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		OPEN: 1,
		CLOSE: 2,
		SET_POSITION: 4,
		STOP: 8,
		OPEN_TILT: 16,
		CLOSE_TILT: 32,
		STOP_TILT: 64,
		SET_TILT_POSITION: 128
	});

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
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>

		<!-- POSITION -->
		{#if supports?.SET_POSITION}
			<h2>
				{$lang('position')}

				<span class="align-right">
					{#if attributes?.current_position === 0}
						{$lang('closed')}
					{:else}
						{$lang('open')}

						{#if attributes?.current_position}
							{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(
								attributes?.current_position / 100
							)}
						{/if}
					{/if}
				</span>
			</h2>

			{#if attributes?.current_position}
				<RangeSlider
					bind:value={attributes.current_position}
					min={0}
					max={100}
					on:change={(event) => {
						request = undefined;
						handleChange('set_cover_position', 'position', Math.round(event?.detail));
					}}
				/>
			{/if}
		{/if}

		<!-- POSITION BUTTONS -->

		{#if supports?.CLOSE || supports?.STOP || supports?.OPEN}
			<h2>{$lang('buttons')}</h2>
		{/if}

		<div class="buttons-container">
			{#if supports?.CLOSE}
				<button
					use:Ripple={$ripple}
					on:click={() => handleClick('close_cover')}
					title={$lang('close_cover')}
				>
					<Icon icon="raphael:arrowdown" height="none" />
				</button>
			{/if}

			{#if supports?.STOP}
				<button
					on:click={() => handleClick('stop_cover')}
					use:Ripple={$ripple}
					title={$lang('stop_cover')}
				>
					<Icon icon="ic:round-stop" height="none" />
				</button>
			{/if}

			{#if supports?.OPEN}
				<button
					on:click={() => handleClick('open_cover')}
					use:Ripple={$ripple}
					title={$lang('open_cover')}
				>
					<Icon icon="raphael:arrowup" height="none" />
				</button>
			{/if}
		</div>

		<!-- TILT POSITION -->
		{#if supports?.SET_TILT_POSITION}
			<h2>
				{$lang('tilt_position')}

				<span class="align-right">
					{#if attributes?.current_tilt_position === 0}
						{$lang('closed')}
					{:else}
						{$lang('open')}

						{#if attributes?.current_tilt_position}
							{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(
								attributes?.current_tilt_position / 100
							)}
						{/if}
					{/if}
				</span>
			</h2>

			{#if attributes.current_tilt_position}
				<RangeSlider
					bind:value={attributes.current_tilt_position}
					min={0}
					max={100}
					on:change={(event) => {
						request = undefined;
						handleChange('set_cover_tilt_position', 'tilt_position', Math.round(event?.detail));
					}}
				/>
			{/if}
		{/if}

		{#if supports?.CLOSE_TILT || supports?.STOP_TILT || supports?.OPEN_TILT}
			<h2>{$lang('buttons')}</h2>
		{/if}

		<!-- TILT BUTTONS -->
		<div class="buttons-container">
			{#if supports?.CLOSE_TILT}
				<button
					on:click={() => handleClick('close_cover_tilt')}
					use:Ripple={$ripple}
					title={$lang('close_tilt_cover')}
				>
					<Icon icon="raphael:arrowdown" height="none" />
				</button>
			{/if}

			{#if supports?.STOP_TILT}
				<button
					on:click={() => handleClick('stop_cover_tilt')}
					use:Ripple={$ripple}
					title={$lang('stop_cover')}
				>
					<Icon icon="ic:round-stop" height="none" />
				</button>
			{/if}

			{#if supports?.OPEN_TILT}
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
