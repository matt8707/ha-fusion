<script lang="ts">
	import { states, connection, lang, ripple } from '$lib/Stores';
	import { onMount } from 'svelte';
	import Timer from '$lib/Sidebar/Timer.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';
	import { getName } from '$lib/Utils';
	import { callService, type HassEntity } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: any;

	let duration: string;
	let entity: HassEntity;

	$: entity_id = sel?.entity_id;
	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[entity_id];
	}

	$: state = entity?.state;
	$: attributes = entity?.attributes;

	onMount(() => {
		duration = formatDuration(attributes?.duration || '');
	});

	function formatDuration(d: string): string {
		return d
			.split(':')
			.map((part) => part.padStart(2, '0'))
			.join(':');
	}

	function handleClick(service: string) {
		callService($connection, 'timer', service, { entity_id });
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(undefined, entity)}</h1>

		<h2>{$lang('timer')}</h2>

		<Timer {sel} />

		<h2>{$lang('options')}</h2>

		<div class="button-container">
			{#if state === 'active'}
				<button on:click={() => handleClick('pause')} use:Ripple={$ripple}>
					{$lang('pause')}
				</button>

				<button on:click={() => handleClick('finish')} use:Ripple={$ripple}>
					{$lang('finish')}
				</button>
			{:else}
				<button on:click={() => handleClick('start')} use:Ripple={$ripple}>
					{$lang('start')}
				</button>

				<button on:click={() => handleClick('cancel')} use:Ripple={$ripple}>
					{$lang('cancel')}
				</button>
			{/if}
		</div>

		<h2>{$lang('duration')}</h2>

		<div class="duration">
			<input class="input" type="time" step="1" bind:value={duration} />

			<button
				class="input overflow"
				on:click={() => {
					const prevState = state;
					callService($connection, 'timer', 'start', { entity_id, duration });
					if (prevState !== 'active') callService($connection, 'timer', 'pause', { entity_id });
				}}
				use:Ripple={$ripple}
			>
				{$lang('set_state')}
			</button>
		</div>

		<ConfigButtons />
	</Modal>
{/if}

<style>
	button::first-letter {
		text-transform: capitalize;
	}

	.duration {
		display: flex;
		gap: 0.8rem;
	}

	.duration > .input[type='time'] {
		flex-grow: 1;
		width: unset !important;
		color-scheme: dark;
	}

	.duration > button {
		width: unset !important;
	}
</style>
