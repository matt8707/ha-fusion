<script lang="ts">
	import {
		dashboard,
		editMode,
		motion,
		historyUpdater,
		history,
		currentViewId,
		ripple,
		lang,
		historyIndex
	} from '$lib/Stores';
	import { onDestroy, tick } from 'svelte';
	import { modals } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	historyUpdater(snapshot);

	let ignored: boolean;

	/**
	 * Reactive statement to handle
	 * changes to `$history` array
	 */
	$: if ($editMode && $history.length === 0) {
		// create initial entry
		$history = [...$history, JSON.stringify($dashboard)];
	}

	$: canUndo = $historyIndex > 0;

	$: canRedo = $historyIndex < $history.length - 1;

	/**
	 * Checks if a key exists directly on the
	 * provided object or in its nested objects
	 */
	function keyCheck(obj: any, key: string): boolean {
		if (obj && typeof obj === 'object' && key in obj) {
			return true;
		}
		for (const prop of Object.values(obj)) {
			if (typeof prop === 'object' && prop !== null) {
				if (keyCheck(prop, key)) return true;
			}
		}
		return false;
	}

	/**
	 * Adds a snapshot of current dashboard to the history array
	 */
	function snapshot() {
		// ignore 'isDndShadowItem' that svelte-dnd-action creates...
		if (!ignored && keyCheck($dashboard, 'isDndShadowItem')) {
			ignored = true;
			return;
		}

		// after undo, future changes will overwrite history
		if ($historyIndex < $history.length - 1) {
			$history = $history.slice(0, $historyIndex + 1);
		}

		// update history array
		const data = JSON.stringify($dashboard);
		if ($history.length === 0 || $history[$history.length - 1] !== data) {
			$history = [...$history, data];
			$historyIndex = $history.length - 1;
		}
	}

	/**
	 * Restores the selection of a view after navigating history. If the targeted view
	 * doesn't exist anymore, the function will attempt to select the "closest" available
	 */
	async function restoreViewSelection() {
		// wait for updates
		await tick();

		const button =
			document.getElementById(String($currentViewId)) ||
			document.getElementById('navigation')?.querySelector('button');

		if (button) button.click();
	}

	/**
	 * Navigates to a particular state in `$history`
	 */
	function set(newIndex: number) {
		if (newIndex < 0 || newIndex >= $history.length) return;

		$historyIndex = newIndex;
		$dashboard = JSON.parse($history[$historyIndex]);

		restoreViewSelection();
	}

	/**
	 * Keyboard shortcuts for undo and redo
	 */
	function handleKeydown(event: KeyboardEvent) {
		if ($modals.length !== 0 || !$editMode) return;

		if (event.key.toLowerCase() === 'z' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();

			if (event.shiftKey) {
				handleClick('redo');
			} else {
				handleClick('undo');
			}
		}
	}

	/**
	 * Click events for undo and redo
	 */
	function handleClick(action: 'undo' | 'redo') {
		if (action === 'undo') {
			set($historyIndex - 1);
		} else if (action === 'redo') {
			set($historyIndex + 1);
		}
	}

	/**
	 * Resets history and associated variables
	 */
	onDestroy(() => {
		$historyIndex = 0;
		ignored = false;
		$history = [];
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<button
	class="button"
	on:click={() => handleClick('undo')}
	style:cursor={canUndo ? 'pointer' : 'unset'}
	style:opacity={canUndo ? '1' : '0.5'}
	style:transition="opacity {$motion}ms ease"
	title={$lang('undo')}
	use:Ripple={{
		...$ripple,
		opacity: !canUndo ? '0' : $ripple.opacity
	}}
>
	<figure>
		<Icon icon="ion:arrow-undo-sharp" height="none" />
	</figure>
</button>

<button
	class="button"
	on:click={() => handleClick('redo')}
	style:cursor={canRedo ? 'pointer' : 'unset'}
	style:opacity={canRedo ? '1' : '0.5'}
	style:transition="opacity {$motion}ms ease"
	title={$lang('forward')}
	use:Ripple={{
		...$ripple,
		opacity: !canRedo ? '0' : $ripple.opacity
	}}
>
	<figure>
		<Icon icon="ion:arrow-redo-sharp" height="none" />
	</figure>
</button>

<style>
	.button {
		padding: 0.65rem 0.82rem 0.4rem 0.82rem !important;
		text-overflow: clip !important;
	}

	figure {
		margin-right: 0 !important;
	}
</style>
