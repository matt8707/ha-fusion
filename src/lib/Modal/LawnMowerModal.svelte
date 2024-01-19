<script lang="ts">
	import { connection, lang, states, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean;
	export let sel: any;

	// const demo = {
	// 	entity_id: 'lawn_mower.demo_lawn_mower',
	// 	state: 'mowing',
	// 	attributes: {
	// 		friendly_name: 'Lawnzilla',
	// 		supported_features: 7
	// 	},
	// 	context: {
	// 		id: '01HMF1RZPQNSY946Y7R1K5BTVZ',
	// 		parent_id: null,
	// 		user_id: null
	// 	},
	// 	last_changed: '2024-01-18T19:46:40.471Z',
	// 	last_updated: '2024-01-18T19:46:40.471Z'
	// };

	$: entity = $states?.[sel?.entity_id];
	$: state = entity?.state as 'paused' | 'mowing' | 'docked' | 'error';
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		START_MOWING: 1,
		PAUSE: 2,
		DOCK: 4
	});

	/**
	 * Handle click
	 */
	function handleClick(service: string) {
		callService($connection, 'lawn_mower', service, {
			entity_id: entity?.entity_id
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('state')}</h2>

		{$lang(state)}

		<h2>{$lang('lawn_mower_commands')?.replace(':', '')}</h2>

		<div class="button-container">
			{#if supports?.START_MOWING}
				<button
					title={$lang('start_mowing')}
					class:selected={entity?.state === 'mowing'}
					on:click={() => handleClick('start_mowing')}
					use:Ripple={$ripple}
				>
					<div class="icon">
						<Icon icon="ic:round-play-arrow" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.PAUSE}
				<button
					title={$lang('pause')}
					class:selected={entity?.state === 'paused'}
					on:click={() => handleClick('pause')}
					use:Ripple={$ripple}
				>
					<div class="icon">
						<Icon icon="ic:round-pause" height="none" />
					</div>
				</button>
			{/if}

			{#if supports?.DOCK}
				<button
					title={$lang('return_home')}
					on:click={() => handleClick('dock')}
					use:Ripple={$ripple}
				>
					<div class="icon" style="transform: scale(0.85);">
						<Icon icon="ic:round-home" height="none" />
					</div>
				</button>
			{/if}
		</div>

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.button-container > button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		width: 1.6rem;
		height: 1.6rem;
	}
</style>
