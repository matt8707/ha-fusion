<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import RowCamera from '$lib/Modal/CustomPanel/RowCamera.svelte';
	import RowButtons from '$lib/Modal/CustomPanel/RowButtons.svelte';
	import RowSensor from '$lib/Modal/CustomPanel/RowSensor.svelte';
	import RowSlider from '$lib/Modal/CustomPanel/RowSlider.svelte';
	import type { CustomPanelItem } from '$lib/Types';
	import { lang, dashboard } from '$lib/Stores';
	import { getSelected } from '$lib/Utils';

	export let isOpen: boolean;
	export let sel: CustomPanelItem;

	$: liveItem = (getSelected(sel.id, $dashboard) as CustomPanelItem | undefined) ?? sel;
	$: name = liveItem?.name || $lang('custom_panel') || 'Custom Panel';
	$: rows = liveItem?.rows ?? [];
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{name}</h1>

		{#if rows.length === 0}
			<p class="empty">{$lang('no_rows_configured')}</p>
		{:else}
			<div class="rows">
				{#each rows as row (row.id)}
					<div class="row-wrapper">
						{#if row.type === 'camera'}
							<RowCamera {row} />
						{:else if row.type === 'buttons'}
							<RowButtons {row} />
						{:else if row.type === 'sensor'}
							<RowSensor {row} />
						{:else if row.type === 'slider'}
							<RowSlider {row} />
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 0.4rem;
	}

	.row-wrapper {
		width: 100%;
	}

	.empty {
		opacity: 0.45;
		font-size: 0.9rem;
		margin: 1rem 0;
	}
</style>
