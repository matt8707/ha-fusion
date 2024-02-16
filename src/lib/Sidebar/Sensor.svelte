<script lang="ts">
	import { states, editMode, motion, selectedLanguage, lang } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { isTimestamp, relativeTime } from '$lib/Utils';

	export let entity_id: string | undefined = undefined;
	export let prefix: string | undefined = undefined;
	export let suffix: string | undefined = undefined;
	export let date: boolean | undefined = undefined;

	let entity: HassEntity;

	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[entity_id];
	}

	$: state = entity?.state;
</script>

<div
	class="container"
	class:visible={!entity || state || $editMode}
	style:padding-top={!entity || state || $editMode ? '' : '0'}
	style:padding-bottom={!entity || state || $editMode ? '' : '0'}
	style:transition="grid-template-rows {$motion}ms ease, padding {$motion}ms ease"
>
	<div class="expandable">
		{#if ['unavailable', 'unknown'].includes(state)}
			{prefix || ''}{$lang(state)}{suffix || ''}

			<!-- relative time -->
		{:else if state && date}
			{#if isTimestamp(state)}
				{prefix || ''}{relativeTime(state, $selectedLanguage)}{suffix || ''}
			{:else}
				{prefix || ''}{$lang('invalid_timestamp')}{suffix || ''}
			{/if}

			<!-- state -->
		{:else if state}
			{prefix || ''}{@html state}{suffix || ''}

			<!-- hide -->
		{:else if entity && !state}
			<span>{entity_id}</span>

			<!-- !entity_id -->
		{:else if !entity_id && !state}
			<span>{$lang('sensor')}</span>
		{:else}
			{$lang('unknown')}
		{/if}
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-rows: 0fr;
		overflow: hidden;
		pointer-events: none;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);

		/* need to specify to properly show emoji */
		font-family: 'Inter Variable';
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		padding: var(--theme-sidebar-item-padding);
	}

	.visible {
		grid-template-rows: 1fr;
	}

	.expandable {
		min-height: 0;
		white-space: pre-line;
	}

	span {
		color: rgba(255, 255, 255, 0.25);
	}
</style>
