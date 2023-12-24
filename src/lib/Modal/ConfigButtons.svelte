<script lang="ts">
	import { dashboard, record, lang, editMode, ripple, motion } from '$lib/Stores';
	import { tick } from 'svelte';
	import { closeModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { fade } from 'svelte/transition';

	export let sel: any = undefined;

	/**
	 * Removes 'ButtonItem' | 'SidebarItem' | 'ViewItem' from `$dashboard`.
	 */
	async function removeObj() {
		if (!sel) return;
		closeModal();
		if (sel.type === 'button') {
			removeButtonItem();
		} else if (sel.type) {
			removeSidebarItem();
		} else if (sel.sections) {
			await removeViewItem();
		}
		$record();
	}

	function removeButtonItem() {
		$dashboard.views = $dashboard.views.map((view) => ({
			...view,
			sections: view.sections?.map((section) => ({
				...section,
				sections:
					section.type === 'horizontal-stack' && section.sections
						? section.sections.map((nestedSection) => ({
								...nestedSection,
								items: nestedSection.items?.filter((item) => item.id !== sel.id)
							}))
						: section.sections,
				items:
					section.type !== 'horizontal-stack'
						? section.items?.filter((item) => item.id !== sel.id)
						: section.items
			}))
		}));
	}

	function removeSidebarItem() {
		$dashboard.sidebar = $dashboard.sidebar.filter((item) => item.id !== sel.id);
	}

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
	 * When clicking 'change type' in modal, close modal
	 * and programmatically click 'edit' on sidebar item
	 */
	async function handleChangeType() {
		$dashboard.sidebar = $dashboard.sidebar.map((item) =>
			item.id === sel?.id ? { ...item, type: 'configure' } : item
		);

		const element = document.getElementById(String(sel?.id));

		await tick();
		closeModal();

		let button: HTMLButtonElement | null | undefined;
		button = element?.querySelector('div > button');
		if (button) button.click();
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

			{#if sel?.type && !['button', 'configure'].includes(sel.type)}
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
