<script lang="ts">
	import { showDrawer, editMode, motion, lang, ripple, disableMenuButton } from '$lib/Stores';
	import { onDestroy, tick } from 'svelte';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import type { SidebarItem } from '$lib/Types';

	export let sel: SidebarItem;

	let timeout: ReturnType<typeof setTimeout> | null;

	/**
	 * Opens `SidebarItemConfig` ignoring `$editMode`
	 * but obeys `$disableMenuButton` "lockout"...
	 */
	async function handleClick() {
		if (!$editMode && !$disableMenuButton) {
			openModal(() => import('$lib/Modal/SidebarItemConfig.svelte'), { sel });

			await tick();

			timeout = setTimeout(() => {
				$editMode = true;
				$showDrawer = true;
			}, $motion);
		}
	}

	onDestroy(() => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	});
</script>

<div class="container">
	<span>
		{$lang('nothing_configured')}
	</span>

	<button on:click={handleClick} use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}>
		{$lang('edit')}
	</button>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr auto;
		padding: var(--theme-sidebar-item-padding);
		align-items: center;
	}

	span {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	button {
		background: #ffc008;
		color: #3b0f0f;
		padding: 0.4rem 0.7rem;
		font-weight: 500;
		font-size: 0.8rem;
		cursor: pointer;
		height: 1.8rem;
		border: inherit;
		border-radius: 0.4rem;
		font-family: inherit;
	}
</style>
