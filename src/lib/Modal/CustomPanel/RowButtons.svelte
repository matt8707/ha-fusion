<script lang="ts">
	import { states, connection, ripple, lang } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import { getTogglableService, getDomain } from '$lib/Utils';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import type { ModalRowButtons, ModalButtonItem } from '$lib/Types';

	const DOMAIN_ICONS: Record<string, string> = {
		light: 'mdi:lightbulb',
		switch: 'mdi:toggle-switch',
		automation: 'mdi:robot',
		script: 'mdi:script-text',
		input_boolean: 'mdi:toggle-switch',
		scene: 'mdi:palette',
		fan: 'mdi:fan',
		cover: 'mdi:window-shutter',
		lock: 'mdi:lock',
		media_player: 'mdi:play-circle',
		vacuum: 'mdi:robot-vacuum',
		button: 'mdi:gesture-tap-button',
		input_button: 'mdi:gesture-tap-button'
	};

	export let row: ModalRowButtons;
	export let configMode = false;

	$: columns = Math.min(Math.max(row?.columns ?? 2, 1), 4);
	$: items = row?.items ?? [];

	function getEntity(entity_id: string | undefined) {
		return entity_id ? $states[entity_id] : undefined;
	}

	function getButtonLabel(btn: ModalButtonItem) {
		if (btn.name) return btn.name;
		const entity = getEntity(btn.entity_id);
		return entity?.attributes?.friendly_name ?? btn.entity_id ?? '?';
	}

	function getButtonIcon(btn: ModalButtonItem) {
		if (btn.icon) return btn.icon;
		const domain = getDomain(btn.entity_id);
		return DOMAIN_ICONS[domain ?? ''] ?? 'mdi:gesture-tap';
	}

	function isActive(btn: ModalButtonItem): boolean {
		const entity = getEntity(btn.entity_id);
		if (!entity) return false;
		return ['on', 'active', 'open', 'unlocked', 'cleaning', 'playing'].includes(entity.state);
	}

	function isDisabled(btn: ModalButtonItem): boolean {
		if (configMode) return true;
		return !btn.entity_id || !$states[btn.entity_id ?? ''];
	}

	async function handleClick(btn: ModalButtonItem) {
		if (!btn.entity_id) return;
		const entity = getEntity(btn.entity_id);
		if (!entity) return;

		const domain = getDomain(btn.entity_id);
		let service = btn.service;

		if (!service) {
			// use togglable service or domain default
			service = getTogglableService(entity);
		}

		if (!service || !domain) return;

		const [svcDomain, svcName] = service.includes('.') ? service.split('.') : [domain, service];

		await callService($connection, svcDomain, svcName, { entity_id: btn.entity_id });
	}
</script>

<div class="row-buttons" style:--columns={columns}>
	{#if items.length === 0 && configMode}
		<div class="empty-hint">{$lang('no_buttons')}</div>
	{:else}
		{#each items as btn (btn.id)}
			{@const active = isActive(btn)}
			{@const disabled = isDisabled(btn)}
			<button
				class:active
				class:disabled
				{disabled}
				on:click={() => handleClick(btn)}
				use:Ripple={$ripple}
				title={getButtonLabel(btn)}
			>
				<span class="btn-icon">
					<Icon icon={getButtonIcon(btn)} height="none" />
				</span>
				<span class="btn-label">{getButtonLabel(btn)}</span>
			</button>
		{/each}
	{/if}
</div>

<style>
	.row-buttons {
		display: grid;
		grid-template-columns: repeat(var(--columns, 2), 1fr);
		gap: 0.4rem;
		width: 100%;
	}

	button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.75rem 0.5rem;
		border: none;
		border-radius: 0.6rem;
		background-color: rgba(255, 255, 255, 0.08);
		color: white;
		font-family: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			opacity 150ms ease;
		overflow: hidden;
		position: relative;
		min-height: 4rem;
	}

	button:hover:not(.disabled) {
		background-color: rgba(255, 255, 255, 0.14);
	}

	button.active {
		background-color: rgba(255, 255, 255, 0.18);
	}

	button.disabled {
		opacity: 0.35;
		cursor: default;
	}

	.btn-icon {
		font-size: 1.4rem;
		display: flex;
	}

	.btn-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		text-align: center;
	}

	.empty-hint {
		opacity: 0.4;
		font-size: 0.85rem;
		padding: 1rem;
		text-align: center;
		grid-column: 1 / -1;
	}
</style>
