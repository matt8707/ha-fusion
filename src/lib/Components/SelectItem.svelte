<script lang="ts">
	import { itemActions, highlightSearch, CloseButton } from 'svelecte/item';
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import Icon from '@iconify/svelte';

	interface Item {
		icon?: string;
		id?: string;
		label?: string;
	}

	export let item: Item = {};
	export let inputValue: string;
	export let index = -1;
	export let isSelected = false;
	export let isDisabled = false;
	export let isMultiple = false;
	export let formatter: any = null;
	export let disableHighlight = false;
</script>

<div
	class="sv-item"
	use:itemActions={{ item, index }}
	class:is-selected={isSelected}
	on:select
	on:deselect
	on:hover
>
	<div class="sv-item-content">
		<div class="icon-text-wrapper">
			<div class="icon-container">
				{#if item?.icon && !isDisabled}
					<Icon icon={item?.icon} height="none" width="100%" />
				{:else if item?.label && !isDisabled}
					<ComputeIcon entity_id={item.label} />
				{/if}
			</div>

			{@html isSelected
				? `${formatter(item, isSelected, inputValue)}`
				: highlightSearch(item, isSelected, inputValue, formatter, disableHighlight)}

			<!-- <div class="item-container">
				<span class="label">{item?.label}</span>
				<span class="id">{item?.id}</span>
			</div> -->
		</div>
	</div>
	{#if isSelected && isMultiple}
		<CloseButton />
	{/if}
</div>

<style>
	.icon-text-wrapper {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.95rem;
	}

	.icon-container {
		display: flex;
		width: 1.2rem;
		height: 1.2rem;
		align-items: center;
	}
</style>
