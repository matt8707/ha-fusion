<script lang="ts">
	import Select from '$lib/Components/Select.svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { ripple, entityList, lang } from '$lib/Stores';
	import { createEventDispatcher, tick } from 'svelte';
	import type { ModalButtonItem } from '$lib/Types';

	export let btn: ModalButtonItem;

	const dispatch = createEventDispatcher();

	$: options = $entityList('');
	$: entityPlaceholder = $lang('entity');

	// Fixed dropdown positioning — the Select dropdown must escape the modal overflow context.
	let rowEl: HTMLElement;
	let removeBtnEl: HTMLElement | undefined;
	let dropdownTop = 0;
	let dropdownLeft = 0;
	let dropdownWidth = 0;

	async function handleFocusIn() {
		await tick();
		if (rowEl) {
			const rowRect = rowEl.getBoundingClientRect();
			const removeBtnWidth = removeBtnEl ? removeBtnEl.getBoundingClientRect().width + 8 : 0;
			dropdownTop = rowRect.bottom + 4;
			dropdownLeft = rowRect.left;
			dropdownWidth = rowRect.width - removeBtnWidth;
		}
	}
</script>

<div
	class="btn-row"
	bind:this={rowEl}
	on:focusin={handleFocusIn}
	style="--dropdown-top: {dropdownTop}px; --dropdown-left: {dropdownLeft}px; --dropdown-width: {dropdownWidth}px"
>
	<Select
		{options}
		placeholder={entityPlaceholder}
		value={btn.entity_id}
		computeIcons={true}
		clearable={true}
		on:change={(e) => dispatch('change', { id: btn.id, entity_id: e.detail })}
	/>
	<button
		class="remove-btn"
		bind:this={removeBtnEl}
		on:click={() => dispatch('remove', btn.id)}
		use:Ripple={{ ...$ripple, color: 'rgba(255,80,80,0.3)' }}
	>
		<Icon icon="mingcute:close-fill" height="0.9rem" />
	</button>
</div>

<style>
	.btn-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}

	.btn-row :global(.container) {
		flex: 1;
	}

	.btn-row :global(.wrapper) {
		position: fixed;
		z-index: 1000;
		top: var(--dropdown-top);
		left: var(--dropdown-left);
		width: var(--dropdown-width);
	}

	.remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		opacity: 0.4;
		border-radius: 0.3rem;
		padding: 0.2rem;
		flex-shrink: 0;
	}

	.remove-btn:hover {
		opacity: 1;
		background-color: rgba(255, 80, 80, 0.2);
	}
</style>
