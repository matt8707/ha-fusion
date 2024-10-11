<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import type { ShapeConfig } from 'konva/lib/Shape';
	import Icon from '@iconify/svelte';
	import { icons } from '$lib/Modal/PictureElements/icons';
	import { getFontList } from '$lib/Modal/PictureElements/fonts';

	export let konva: KonvaEditor;
	export let selectedShape: ShapeConfig;
	export let selectedShapes: ShapeConfig[];
	export let setAttribute: (id: string, key: string, event: Event) => void;

	let collapsed = true;
	let fonts: string[] = [];

	// compare available fonts to font list
	onMount(async () => {
		fonts = await getFontList();
	});

	$: oneSel = selectedShapes?.length === 1;
	$: attr = selectedShape?.attrs;
	$: validText = ['text', 'state-label'].includes(attr?.type);
	$: disabled = !oneSel || !validText || !attr?.draggable;

	// attrs
	$: fontFamily = (oneSel && attr?.fontFamily) || 'Inter Variable';
	$: fontSize = oneSel ? `${attr?.fontSize ?? 0} px` : '14 px';

	$: letterSpacing = oneSel ? `${attr?.letterSpacing ?? 0} px` : '0 px';
	$: lineHeight = `${oneSel ? (attr?.lineHeight ?? 1) * 100 : 100}%`;

	$: align = oneSel && validText ? attr?.align || 'left' : undefined;
	$: ellipsis = oneSel && !!attr?.ellipsis;

	// escape input saveState
	function handleInput(id: string, key: string, event: Event) {
		const target = event?.target as HTMLInputElement;
		if (fonts.includes(target?.value)) {
			konva.updateAttr(id, key, target.value, true);
		}
	}

	// convert to percent
	function handleLineHeight(event: Event) {
		const target = event?.target as HTMLInputElement;
		if (target && target.value) {
			const value = parseFloat(target.value) / 100;
			if (!isNaN(value)) {
				konva.updateAttr(attr?.id, 'lineHeight', value);
			} else {
				target.value = lineHeight;
			}
		}
	}

	// 'normal' | 'bold' | 'italic' | 'bold italic'
	const bold = '600';

	function handleFontStyle(fontStyle: string | undefined, value: '600' | 'italic') {
		const parts = new Set(fontStyle?.split(' ') || []);
		parts.delete('normal');

		if (parts.has(value)) {
			parts.delete(value);
		} else {
			parts.add(value);
		}

		const updated = parts.size ? Array.from(parts).join(' ') : 'normal';
		konva.updateAttr(attr?.id, 'fontStyle', updated);
	}

	// multiple attributes not implemented yet (setAttrs)
	function handleEllipsis() {
		if (attr?.ellipsis) {
			konva.updateAttr(attr?.id, 'ellipsis', false);
		} else {
			konva.updateAttr(attr?.id, 'ellipsis', true);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="konva-header"
	on:click={() => {
		collapsed = !collapsed;
	}}
>
	<div class="title">
		<Icon icon={icons['text']} width="20" height="20" />

		<h3>Text</h3>
	</div>

	<div class="right">
		<button title={collapsed ? 'Expand' : 'Collapse'}>
			<Icon icon={icons[collapsed ? 'expand' : 'collapse']} width="20" height="20" />
		</button>

		<button
			title={selectedShape?.attrs?.box ? 'Disable Text Box' : 'Enable Text Box'}
			on:click|stopPropagation={() => konva.toggleTextBox(selectedShape?.attrs?.id)}
			disabled={selectedShapes?.length !== 1 ||
				!selectedShape?.attrs?.draggable ||
				!['text', 'state-label'].includes(selectedShape?.attrs?.type)}
		>
			<Icon icon={icons['textBox']} width="20" height="20" />
		</button>
	</div>
</div>

{#if !collapsed}
	<div class="items" transition:slide={{ duration: 190, easing: expoOut }}>
		<div class="top"></div>

		<div class="group-font-size">
			<!-- FONT -->
			<div class="item" title="Font">
				<input
					type="text"
					id="fontFamily"
					list="font-list"
					value={fontFamily}
					on:input={(event) => handleInput(attr?.id, 'fontFamily', event)}
					on:change={(event) => setAttribute(attr?.id, 'fontFamily', event)}
					{disabled}
				/>

				<datalist id="font-list">
					{#each fonts as font}
						<option value={font}></option>
					{/each}
				</datalist>
			</div>

			<!-- SIZE -->
			<div class="item" title="Size">
				<input
					type="text"
					id="fontSize"
					value={fontSize}
					on:change={(event) => setAttribute(attr?.id, 'fontSize', event)}
					{disabled}
				/>
			</div>
		</div>

		<div class="group-spacing-height">
			<!-- LETTER SPACING -->
			<div class="item" title="Letter Spacing">
				<div class="icon">
					<Icon icon={icons['letterSpacing']} width="20" height="20" />
				</div>

				<input
					type="text"
					id="letterSpacing"
					value={letterSpacing}
					on:change={(event) => setAttribute(attr?.id, 'letterSpacing', event)}
					{disabled}
				/>
			</div>

			<!-- LINE HEIGHT -->
			<div class="item" title="Line Height">
				<div class="icon">
					<Icon icon={icons['lineHeight']} width="20" height="20" />
				</div>

				<input
					type="text"
					id="lineHeight"
					value={lineHeight}
					on:change={handleLineHeight}
					{disabled}
				/>
			</div>
		</div>

		<div class="group-weight-align">
			<!-- BOLD -->
			<div class="item">
				<button
					title="Bold"
					id="bold"
					on:click={() => handleFontStyle(attr?.fontStyle, bold)}
					class:selected={attr?.fontStyle?.includes(bold)}
					{disabled}
				>
					<Icon icon={icons['bold']} width="20" height="20" />
				</button>

				<!-- ITALIC -->
				<button
					title="Italic"
					id="italic"
					on:click={() => handleFontStyle(attr?.fontStyle, 'italic')}
					class:selected={attr?.fontStyle?.includes('italic')}
					{disabled}
				>
					<Icon icon={icons['italic']} width="20" height="20" />
				</button>

				<!-- DIVIDER -->
				<span class="divider"></span>

				<!-- ALIGN LEFT -->
				<button
					title="Align Left"
					id="alignLeft"
					on:click={() => konva.updateAttr(attr?.id, 'align', 'left')}
					class:selected={align === 'left'}
					{disabled}
				>
					<Icon icon={icons['alignLeft']} width="20" height="20" />
				</button>

				<!-- ALIGN CENTER -->
				<button
					title="Align Center"
					id="alignCenter"
					on:click={() => konva.updateAttr(attr?.id, 'align', 'center')}
					class:selected={align === 'center'}
					{disabled}
				>
					<Icon icon={icons['alignCenter']} width="20" height="20" />
				</button>

				<!-- ALIGN RIGHT -->
				<button
					title="Align Right"
					id="alignRight"
					on:click={() => konva.updateAttr(attr?.id, 'align', 'right')}
					class:selected={align === 'right'}
					{disabled}
				>
					<Icon icon={icons['alignRight']} width="20" height="20" />
				</button>

				<!-- DIVIDER -->
				<span class="divider"></span>

				<!-- ELLIPSIS -->
				<button
					title="Ellipsis"
					id="ellipsis"
					on:click={handleEllipsis}
					class:selected={ellipsis}
					{disabled}
				>
					<Icon icon={icons['ellipsis']} width="20" height="20" />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.konva-header {
		cursor: pointer;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0 0.8rem 0.95rem 0.8rem;
		overflow-y: scroll;
		overflow-x: hidden;
	}

	.item {
		display: flex;
		gap: 0.15rem;
	}

	.group-font-size {
		display: grid;
		grid-template-columns: 1fr 0.4fr;
		gap: 0.2rem;
	}

	.group-font-size input:first-child {
		min-width: 7.5rem !important;
	}

	.group-font-size input:last-child {
		min-width: 3.5rem !important;
	}

	.group-spacing-height {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.2rem;
	}

	.group-spacing-height .icon {
		display: flex;
		align-self: center;
		margin-right: 0.1rem;
	}

	.group-spacing-height input {
		min-width: 4rem !important;
	}

	.group-weight-align {
		display: flex;
	}

	.divider {
		border-right: 1px solid rgba(255, 255, 255, 0.15);
		border-left: 1px solid rgba(0, 0, 0, 0.15);
		width: 2px;
		margin: 0.4rem 0.8rem;
	}

	.item input {
		background-color: rgba(0, 0, 0, 0.35);
		padding: 0.3rem 0.5rem 0.35rem 0.5rem;
		color: #d5d5d5;
		min-width: 8rem;
		width: 100%;
		border: none;
		border-radius: 0.3rem;
		color: inherit;
	}

	.item input:disabled {
		opacity: 0.5;
	}

	.item button {
		all: unset;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		border-radius: 0.4rem;
		width: 2rem;
		aspect-ratio: 1 / 1;
		justify-content: center;
		align-items: center;
		margin-left: 1px;
	}

	.selected {
		background-color: rgba(0, 0, 0, 0.35) !important;
	}

	.item button:hover:not(.selected) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.item button:active {
		background-color: rgba(0, 0, 0, 0.1) !important;
	}

	.item button:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.item button:active:disabled {
		background-color: transparent !important;
	}

	.item button:hover:disabled {
		background-color: transparent;
	}
</style>
