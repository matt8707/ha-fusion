<script lang="ts">
	import {
		editMode,
		motion,
		lang,
		ripple,
		dragging,
		draggingView,
		dashboard,
		historyIndex,
		history,
		currentViewId,
		clickOriginatedFromMenu
	} from '$lib/Stores';
	import { tick } from 'svelte';
	import { modals, openModal, closeModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	export let modified: boolean;
	export let toggleDrawer: () => void;

	let width: number;

	$: text = $lang($editMode ? 'done' : 'edit_ui');

	/**
	 * If changes have been made, prompt the user for
	 * confirmation before discarding changes and exiting.
	 *
	 * Early return if dnd `$dragging` is true, otherwise it's
	 * possible to exit edit mode before changes are recorded.
	 */
	async function handleClick() {
		if ($dragging || $draggingView) return;

		if (!modified) {
			toggleEditMode('toggle');
			return;
		}

		openModal(() => import('$lib/Modal/ConfirmAlert.svelte'), {
			title: $lang('unsaved_changes_title'),
			message: $lang('unsaved_changes'),
			confirm: () => {
				toggleEditMode('restore');
				closeModal();
			},
			cancel: () => {
				toggleEditMode('cancel');
				closeModal();
			}
		});
	}

	/**
	 * If no modals are open delegate to
	 * handleClick when pressing Esc key
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && $modals.length === 0 && $editMode) {
			handleClick();
			// don't focus on underlying element
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	}

	/**
	 * Toggles edit mode based on received message
	 *
	 * - 'cancel': Resets the menu click origin flag
	 * - 'restore': Restores the dashboard's state from history
	 * - 'toggle': Toggles edit mode
	 */
	async function toggleEditMode(message: string) {
		switch (message) {
			case 'cancel':
				$clickOriginatedFromMenu = false;
				break;

			case 'restore':
				$editMode = false;

				$dashboard = JSON.parse($history?.[0]);
				$historyIndex = 0;

				if ($clickOriginatedFromMenu) {
					toggleDrawer();
				}

				await tick();

				/**
				 * CAUTION: if layout changes this will
				 * break because of getElementById
				 */

				/* Click current view, if not present click first view */
				if ($currentViewId) {
					const current = document.getElementById(String($currentViewId));
					const firstButtonInNavigation = document
						.getElementById('navigation')
						?.querySelector('button');

					if (current) {
						current.click();
					} else if (firstButtonInNavigation) {
						firstButtonInNavigation.click();
					} else {
						$currentViewId = $dashboard?.views?.[0]?.id;
					}
				}

				break;

			case 'toggle':
				$editMode = !$editMode;
				if ($clickOriginatedFromMenu) {
					toggleDrawer();
				}
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<button
	id="editmode"
	class="button"
	on:click={handleClick}
	style:color={$editMode ? '#3b0f10' : 'inherit'}
	style:background-color={$editMode ? '#ffc107' : 'var(--theme-drawer-button-background-color)'}
	style:width="{width + 1}px"
	style:transition="all {$motion}ms ease"
	use:Ripple={{
		...$ripple,
		color: !$editMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.35)'
	}}
>
	<figure>
		<Icon icon="solar:pen-2-bold-duotone" height="none" />
	</figure>

	<span>{text}</span>
</button>

<!--  hidden reference -->
<button
	class="button"
	style:position="absolute"
	style:visibility="hidden"
	style:pointer-events="none"
	bind:clientWidth={width}
>
	<figure>
		<Icon icon="solar:pen-2-bold-duotone" height="none" />
	</figure>

	<span>{text}</span>
</button>
