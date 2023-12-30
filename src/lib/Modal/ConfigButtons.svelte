<script lang="ts">
	import { dashboard, record, lang, editMode, ripple, motion } from '$lib/Stores';
	import { tick } from 'svelte';
	import { closeModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { fade } from 'svelte/transition';

	export let sel: any = undefined;

	/**
	 * Checks if current id is in/from sidebar
	 */
	function sidebarItem() {
		return $dashboard.sidebar.some((item) => item?.id === sel?.id);
	}

	/**
	 * Removes a sidebarItem
	 */
	function removeSidebarItem() {
		$dashboard.sidebar = $dashboard.sidebar.filter((item) => item?.id !== sel?.id);
	}

	/**
	 * Get id from a mainItem
	 */
	function mainItem(callback: (item: any) => any) {
		const process = (section: any) => ({
			...section,
			items: section.items?.map(callback).filter((item: any) => item !== null) || [],
			sections: section.sections?.map(process) || []
		});

		$dashboard.views = $dashboard.views.map((view) => ({
			...view,
			sections: view.sections?.map(process) || []
		}));
	}

	/**
	 * Removes a ViewItem
	 */
	async function removeViewItem() {
		const index = $dashboard.views.findIndex((view) => view.id === sel.id);
		$dashboard.views = [...$dashboard.views.slice(0, index), ...$dashboard.views.slice(index + 1)];
		// selects another view
		await tick();
		const adjust = Math.min(index, $dashboard.views.length - 1);
		const view = document
			.getElementById('navigation')
			?.querySelector<HTMLButtonElement>(`button:nth-of-type(${adjust + 1})`);
		view?.click();
	}

	/**
	 * Removes 'SidebarItem' | 'MainItem' | 'ViewItem' from `$dashboard`.
	 */
	async function removeObj() {
		if (!sel) return;
		closeModal();

		if (sidebarItem()) {
			removeSidebarItem();
		} else if (sel?.type) {
			mainItem((item) => (item?.id !== sel?.id ? item : null));
		} else if (sel.sections) {
			await removeViewItem();
		}
		$record();
	}

	/**
	 * When clicking 'change type' in modal, close modal
	 * and programmatically click 'edit' on sidebar or main item
	 */
	async function handleChangeType() {
		const item = ((item: { id: string }) =>
			item.id === sel?.id ? { ...item, type: 'configure' } : item) as any;

		if (sidebarItem()) {
			$dashboard.sidebar = $dashboard.sidebar.map(item);
		} else {
			mainItem(item);
		}

		const element = document.getElementById(String(sel?.id));

		await tick();
		closeModal();

		const div = element?.querySelector('div');
		if (div) div.click();
	}
</script>

<div class="container">
	<div class="align-left">
		{#if $editMode && (sel?.type || sel?.sections)}
			<button
				transition:fade={{ duration: $motion }}
				class="remove action"
				on:click={removeObj}
				use:Ripple={{
					...$ripple,
					color: 'rgba(0, 0, 0, 0.35)'
				}}
			>
				{$lang('remove')}
			</button>

			{#if sel?.type && !['configure'].includes(sel.type)}
				<button
					transition:fade={{ duration: $motion }}
					class="options action"
					on:click={() => {
						handleChangeType();
						$record();
					}}
					use:Ripple={$ripple}
				>
					{$lang('change_type')}
				</button>
			{/if}
		{/if}
	</div>

	<button class="done action" on:click={closeModal} use:Ripple={$ripple}>
		{$lang('done')}
	</button>
</div>

<style>
	.container {
		display: flex;
		justify-content: space-between;
		margin-top: 2.37rem;
	}

	.align-left {
		display: flex;
		gap: 0.8rem;
	}
</style>
