<script lang="ts">
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';

	export let konva: KonvaEditor;

	const arrowKeyAmount = 0.5;

	/**
	 * Handles keydown events for keyboard shortcuts in konvaEditor
	 */
	function handleKeydown(event: KeyboardEvent) {
		const { target, metaKey, ctrlKey, shiftKey, key } = event;
		const element = (target as HTMLElement)?.tagName;
		if (element === 'INPUT' || element === 'TEXTAREA') return;

		const cmd = metaKey || ctrlKey;

		if (!cmd) {
			switch (key) {
				case 'v':
					konva.setMode('default');
					break;
				case 'h':
					konva.setMode('pan');
					break;
				case 'z':
					konva.setMode('zoom');
					break;
				case 'Alt':
					konva.altKey = true;
					konva.updateCursor();
					break;
				case ' ':
					konva.spaceKey = true;
					konva.startPan();
					break;
				case 'Shift':
					konva.shiftPressed = true;
					konva.updateRotationSnaps();
					break;
				case 'Delete':
				case 'Backspace':
					konva.deleteSelected();
					break;
				case 'ArrowUp':
					konva.moveSelectedShapes(0, -arrowKeyAmount);
					break;
				case 'ArrowRight':
					konva.moveSelectedShapes(arrowKeyAmount, 0);
					break;
				case 'ArrowDown':
					konva.moveSelectedShapes(0, arrowKeyAmount);
					break;
				case 'ArrowLeft':
					konva.moveSelectedShapes(-arrowKeyAmount, 0);
					break;
			}
		} else if (cmd) {
			switch (key) {
				case 'a':
					event.preventDefault();
					konva.selectAll();
					break;
				case 'j':
					event.preventDefault();
					konva.duplicateSelected();
					break;
				case 'g':
					event.preventDefault();
					konva.handleGroup();
					break;
				case 'l':
					event.preventDefault();
					konva.toggleDraggable();
					break;
				case ',':
					event.preventDefault();
					konva.toggleVisibility();
					break;
				case 'z':
					event.preventDefault();
					if (shiftKey) {
						konva.redo();
					} else {
						konva.undo();
					}
					break;
			}
		}
	}

	/**
	 * Handles the release of alt, space, and shift keys
	 */
	function handleKeyup(event: KeyboardEvent) {
		const { key, code } = event;

		if (key === 'Alt') {
			konva.altKey = false;
			konva.updateCursor();
		} else if (code === 'Space') {
			konva.spaceKey = false;
			konva.stopPan();
		} else if (key === 'Shift') {
			konva.shiftPressed = false;
			konva.updateRotationSnaps();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
