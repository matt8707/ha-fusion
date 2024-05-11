<script lang="ts">
	import { states, connection, lang, timer, selectedLanguage, motion } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import Toggle from '$lib/Components/Toggle.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName } from '$lib/Utils';
	import Icon from '@iconify/svelte';
	import { relativeTime } from '$lib/Utils';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import StateLogic from '$lib/Components/StateLogic.svelte';

	export let isOpen: boolean;
	export let sel: any;

	let description: string | undefined;

	$: entity = $states[sel?.entity_id];
	$: toggle = entity?.state === 'on';
	$: current = entity?.attributes?.current > 0;

	/**
	 * Handle service call
	 */
	async function handle(service: string) {
		await callService($connection, 'script', service, {
			entity_id: entity?.entity_id
		});
	}

	/**
	 * Fetch automation description
	 */
	onMount(async () => {
		try {
			const respone: { config: any } = await $connection?.sendMessagePromise({
				type: 'script/config',
				entity_id: sel?.entity_id
			});
			description = respone?.config?.description;
		} catch (err) {
			console.error(err);
		}
	});
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<div class="container">
			<!-- state -->
			<div class="section">
				<div class="icon" title={$lang('state')}>
					{#if current}
						<div class="running">
							<Icon icon="mdi:cog" height="none" width="1.25rem" />
						</div>
					{:else}
						<Icon icon="mdi:script-text" height="none" width="1.25rem" />
					{/if}
				</div>

				{$lang('script')}:

				<StateLogic entity_id={sel?.entity_id} selected={sel} />

				<div class="toggle">
					<Toggle bind:checked={toggle} on:change={() => handle('toggle')} />
				</div>
			</div>

			<!-- description -->
			{#if description}
				<div class="section" in:slide={{ duration: $motion / 2 }}>
					<div class="icon" title={$lang('description')}>
						<Icon icon="mdi:text" height="none" width="1.25rem" />
					</div>

					{description}
				</div>
			{/if}

			<!-- last_triggered -->
			<div class="section">
				<div class="icon" title={$lang('last_triggered')}>
					<Icon icon="ic:twotone-access-time" height="none" width="1.25rem" />
				</div>

				{#if entity?.attributes?.last_triggered}
					{$lang('last_triggered')}
					{$timer && relativeTime(entity?.attributes?.last_triggered, $selectedLanguage)}
				{:else}
					{$lang('never_triggered')}
				{/if}
			</div>

			<ConfigButtons {sel} />
		</div>
	</Modal>
{/if}

<style>
	.container {
		display: grid;
		margin-top: 1.5rem;
		grid-gap: 0.6rem;
	}

	.section {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}

	.icon {
		flex-shrink: 0;
		flex-grow: 0;
		align-self: flex-start;
		margin-top: 0.2rem;
		opacity: 0.5;
	}

	.toggle {
		margin-left: auto;
		height: 25px;
	}

	.running {
		display: inline-flex;
		animation: rotate 2.5s linear infinite;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
