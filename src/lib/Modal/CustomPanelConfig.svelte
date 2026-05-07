<script lang="ts">
	import {
		dashboard,
		record,
		lang,
		ripple,
		motion,
		dragging,
		states,
		entityList
	} from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Select from '$lib/Components/Select.svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import RowCamera from '$lib/Modal/CustomPanel/RowCamera.svelte';
	import RowButtons from '$lib/Modal/CustomPanel/RowButtons.svelte';
	import RowSensor from '$lib/Modal/CustomPanel/RowSensor.svelte';
	import RowSlider from '$lib/Modal/CustomPanel/RowSlider.svelte';
	import ButtonConfigRow from '$lib/Modal/CustomPanel/ButtonConfigRow.svelte';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';
	import { generateId, getSelected } from '$lib/Utils';
	import type {
		CustomPanelItem,
		ModalRow,
		ModalRowType,
		ModalRowCamera,
		ModalRowButtons,
		ModalRowSensor,
		ModalRowSlider,
		ModalButtonItem
	} from '$lib/Types';

	export let isOpen: boolean;
	export let sel: CustomPanelItem;

	// ── Icon & color ─────────────────────────────────────────────────────────
	let icon: string | undefined = sel?.icon;
	let color: string | undefined = sel?.color;

	function handleIcon(event: Event) {
		const val = (event.target as HTMLInputElement).value || undefined;
		icon = val;
		const found = getSelected(sel.id, $dashboard) as CustomPanelItem | undefined;
		if (found) found.icon = val;
		$dashboard = $dashboard;
	}

	function handleColor(event: Event) {
		const val = (event.target as HTMLInputElement).value || undefined;
		color = val;
		const found = getSelected(sel.id, $dashboard) as CustomPanelItem | undefined;
		if (found) found.color = val;
		$dashboard = $dashboard;
	}

	// ── Local copy of rows ──────────────────────────────────────────────────
	let rows: any[] = sel?.rows ? [...sel.rows] : [];
	let selectedRowId: number | null = rows[0]?.id ?? null;

	$: selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

	// ── Typed accessors (avoid `as` in template) ────────────────────────────
	$: selectedCamera = selectedRow?.type === 'camera' ? (selectedRow as ModalRowCamera) : null;
	$: selectedButtons = selectedRow?.type === 'buttons' ? (selectedRow as ModalRowButtons) : null;
	$: selectedSensor = selectedRow?.type === 'sensor' ? (selectedRow as ModalRowSensor) : null;
	$: selectedSlider = selectedRow?.type === 'slider' ? (selectedRow as ModalRowSlider) : null;

	// ── Entity options ──────────────────────────────────────────────────────
	$: allEntities = $entityList('');
	$: cameraEntities = $entityList('camera');

	// ── Tile state: rows eligible as primary (sensor/slider with entity_id) ──
	$: primaryRowOptions = rows
		.filter((r) => !isShadow(r) && (r.type === 'sensor' || r.type === 'slider') && r.entity_id)
		.map((r) => ({
			id: r.id,
			label: r.name || $states[r.entity_id]?.attributes?.friendly_name || r.entity_id
		}));

	function handlePrimaryRow(event: Event) {
		const val = (event.target as HTMLSelectElement).value;
		sel.primary_row_id = val ? Number(val) : undefined;
		$dashboard = $dashboard;
	}

	// ── Row type labels & icons ─────────────────────────────────────────────
	$: rowTypeInfo = {
		camera: { label: $lang('camera') || 'Camera', icon: 'mdi:cctv' },
		buttons: { label: $lang('buttons') || 'Buttons', icon: 'mdi:gesture-tap-button' },
		sensor: { label: $lang('sensor') || 'Sensor', icon: 'mdi:eye' },
		slider: { label: $lang('slider') || 'Slider', icon: 'mdi:tune-vertical' }
	} as Record<ModalRowType, { label: string; icon: string }>;

	// ── Row helpers ──────────────────────────────────────────────────────────
	function rowEntityId(row: any): string | undefined {
		if (row.type === 'camera' || row.type === 'sensor' || row.type === 'slider') {
			return row.entity_id;
		}
		return undefined;
	}

	function isShadow(row: any): boolean {
		return !!row[SHADOW_ITEM_MARKER_PROPERTY_NAME];
	}

	function rowKey(row: any): string {
		return `${row.id}${isShadow(row) ? '_shadow' : ''}`;
	}

	function rowInfo(row: any): { label: string; icon: string } {
		return rowTypeInfo[row.type as ModalRowType] ?? { label: row.type, icon: 'mdi:help' };
	}

	// Cast in script, not in template, to avoid TypeScript errors in Svelte templates.
	function handleAddRow(type: string) {
		addRow(type as ModalRowType);
	}

	// ── Helpers ─────────────────────────────────────────────────────────────
	function newId(): number {
		return generateId($dashboard);
	}

	function addRow(type: ModalRowType) {
		const id = newId();
		let row: ModalRow;

		switch (type) {
			case 'camera':
				row = { id, type: 'camera' };
				break;
			case 'buttons':
				row = { id, type: 'buttons', columns: 2, items: [] };
				break;
			case 'sensor':
				row = { id, type: 'sensor' };
				break;
			case 'slider':
				row = { id, type: 'slider' };
				break;
		}

		rows = [...rows, row];
		selectedRowId = id;
		sync();
		$record();
	}

	function removeRow(id: number) {
		rows = rows.filter((r) => r.id !== id);
		if (selectedRowId === id) {
			selectedRowId = rows[0]?.id ?? null;
		}
		if (sel.primary_row_id === id) {
			sel.primary_row_id = undefined;
		}
		sync();
		$record();
	}

	function sync() {
		sel.rows = rows
			.filter((r) => !isShadow(r))
			.map((r) => {
				const clean: Record<string, unknown> = {};
				for (const key of Object.keys(r)) {
					if (key !== SHADOW_ITEM_MARKER_PROPERTY_NAME) {
						clean[key] = r[key];
					}
				}
				return clean as unknown as ModalRow;
			});
		$dashboard = $dashboard;
	}

	// ── DnD ─────────────────────────────────────────────────────────────────
	function handleDnd(event: CustomEvent) {
		$dragging = true;
		rows = event.detail.items;

		if (event.type === 'finalize') {
			$dragging = false;
			sync();
			$record();
		}
	}

	// ── Per-row field updaters ───────────────────────────────────────────────
	function updateRow(id: number, patch: Partial<ModalRow>) {
		rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
		sync();
	}

	// ── Name ────────────────────────────────────────────────────────────────
	function handleName(event: Event) {
		sel.name = (event.target as HTMLInputElement).value || undefined;
		$dashboard = $dashboard;
	}

	// ── Buttons sub-items ────────────────────────────────────────────────────
	function addButton(rowId: number) {
		const row = rows.find((r) => r.id === rowId);
		if (!row || row.type !== 'buttons') return;
		const typed = row as ModalRowButtons;
		const newBtn: ModalButtonItem = { id: newId() };
		const updated: ModalRowButtons = { ...typed, items: [...(typed.items ?? []), newBtn] };
		rows = rows.map((r) => (r.id === rowId ? updated : r));
		sync();
	}

	function removeButton(rowId: number, btnId: number) {
		const row = rows.find((r) => r.id === rowId);
		if (!row || row.type !== 'buttons') return;
		const typed = row as ModalRowButtons;
		const updated: ModalRowButtons = {
			...typed,
			items: (typed.items ?? []).filter((b) => b.id !== btnId)
		};
		rows = rows.map((r) => (r.id === rowId ? updated : r));
		sync();
	}

	function updateButton(rowId: number, btnId: number, patch: Partial<ModalButtonItem>) {
		const row = rows.find((r) => r.id === rowId);
		if (!row || row.type !== 'buttons') return;
		const typed = row as ModalRowButtons;
		const updated: ModalRowButtons = {
			...typed,
			items: (typed.items ?? []).map((b) => (b.id === btnId ? { ...b, ...patch } : b))
		};
		rows = rows.map((r) => (r.id === rowId ? updated : r));
		sync();
	}

	// Mirrors RowSlider's renderMode logic: domains that produce a real slider.
	function sliderNeedsWarning(entity_id: string | undefined): boolean {
		if (!entity_id) return false;
		const entity = $states[entity_id];
		if (!entity) return false;
		const domain = entity_id.split('.')[0];
		return ![
			'light',
			'media_player',
			'cover',
			'input_number',
			'switch',
			'input_boolean',
			'fan',
			'automation'
		].includes(domain);
	}

	// ── Input handlers (no `as` in template) ────────────────────────────────
	function handleSensorName(event: Event) {
		if (!selectedSensor) return;
		updateRow(selectedSensor.id, { name: (event.target as HTMLInputElement).value || undefined });
	}

	function handleSensorPrefix(event: Event) {
		if (!selectedSensor) return;
		updateRow(selectedSensor.id, { prefix: (event.target as HTMLInputElement).value || undefined });
	}

	function handleSensorSuffix(event: Event) {
		if (!selectedSensor) return;
		updateRow(selectedSensor.id, { suffix: (event.target as HTMLInputElement).value || undefined });
	}

	function handleSliderName(event: Event) {
		if (!selectedSlider) return;
		updateRow(selectedSlider.id, { name: (event.target as HTMLInputElement).value || undefined });
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{sel?.name || $lang('section') || 'Custom Panel'}</h1>

		<!-- ── Name ──────────────────────────────────────────────────────── -->
		<h2>{$lang('name')}</h2>
		<input
			class="input"
			type="text"
			value={sel?.name ?? ''}
			placeholder={$lang('name')}
			on:input={handleName}
		/>

		<!-- ── Icon ──────────────────────────────────────────────────────── -->
		<h2>{$lang('icon')}</h2>
		<div class="icon-gallery-container">
			<InputClear
				condition={icon}
				on:clear={() => {
					icon = undefined;
					sel.icon = undefined;
					$dashboard = $dashboard;
				}}
				let:padding
			>
				<input
					class="input"
					type="text"
					placeholder={$lang('icon')}
					value={sel?.icon ?? ''}
					autocomplete="off"
					spellcheck="false"
					on:input={handleIcon}
					style:padding
				/>
			</InputClear>
			<button
				class="icon-gallery"
				use:Ripple={$ripple}
				title={$lang('icon')}
				on:click={() => window.open('https://icon-sets.iconify.design/', '_blank')}
			>
				<Icon icon="majesticons:open-line" height="1.2rem" />
			</button>
		</div>

		<!-- ── Color ─────────────────────────────────────────────────────── -->
		<h2>{$lang('color')}</h2>
		<InputClear
			condition={color}
			on:clear={() => {
				color = undefined;
				sel.color = undefined;
				$dashboard = $dashboard;
			}}
			let:padding
		>
			<input
				class="input"
				type="text"
				placeholder={$lang('color')}
				value={sel?.color ?? ''}
				autocomplete="off"
				spellcheck="false"
				on:input={handleColor}
				style:padding
			/>
		</InputClear>

		<!-- ── Tile state ────────────────────────────────────────────────── -->
		<h2>{$lang('tile_state')}</h2>
		<select class="input" on:change={handlePrimaryRow}>
			<option value="" selected={sel.primary_row_id == null}>{$lang('none')}</option>
			{#each primaryRowOptions as opt (opt.id)}
				<option value={opt.id} selected={sel.primary_row_id === opt.id}>{opt.label}</option>
			{/each}
		</select>

		<!-- ── Main layout ────────────────────────────────────────────────── -->
		<div class="editor-layout">
			<!-- LEFT: row list + add buttons -->
			<div class="row-list-panel">
				<p class="panel-label">{$lang('rows') || 'Rows'}</p>

				{#if rows.length > 0}
					<section
						use:dndzone={{ items: rows, flipDurationMs: $motion, dropTargetStyle: {} }}
						on:consider={handleDnd}
						on:finalize={handleDnd}
					>
						{#each rows as row (rowKey(row))}
							<div
								class="row-item"
								class:selected={selectedRowId === row.id}
								animate:flip={{ duration: $motion }}
								data-is-dnd-shadow-item-hint={isShadow(row)}
								on:click={() => (selectedRowId = row.id)}
								on:keydown
								role="button"
								tabindex="0"
							>
								<span class="row-type-icon">
									<Icon icon={rowInfo(row).icon} height="1rem" />
								</span>
								<span class="row-type-label">
									{rowInfo(row).label}
									{#if rowEntityId(row)}
										<small>{rowEntityId(row)}</small>
									{/if}
								</span>
								<button
									class="remove-btn"
									on:click|stopPropagation={() => removeRow(row.id)}
									use:Ripple={{ ...$ripple, color: 'rgba(255,80,80,0.3)' }}
									title="Remove row"
								>
									<Icon icon="mingcute:close-fill" height="0.9rem" />
								</button>
								<span class="drag-handle">
									<Icon icon="mdi:drag" height="1rem" />
								</span>
							</div>
						{/each}
					</section>
				{:else}
					<p class="no-rows">{$lang('no_rows') || 'No rows yet.'}</p>
				{/if}

				<!-- Add row buttons — handleAddRow fa il cast nello script -->
				<div class="add-row-buttons">
					{#each Object.entries(rowTypeInfo) as [type, info]}
						<button
							class="add-row-btn"
							on:click={() => handleAddRow(type)}
							use:Ripple={$ripple}
							title="Add {info.label} row"
						>
							<Icon icon={info.icon} height="1rem" />
							{info.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- RIGHT: selected row config -->
			<div class="row-config-panel">
				{#if selectedRow}
					{#key selectedRow.id}
						<div transition:slide={{ duration: $motion, easing: expoOut }}>
							<!-- CAMERA config -->
							{#if selectedCamera}
								<h2>{$lang('camera')}</h2>
								<Select
									options={cameraEntities}
									placeholder={$lang('entity')}
									value={selectedCamera.entity_id}
									computeIcons={true}
									on:change={(e) => updateRow(selectedCamera.id, { entity_id: e.detail })}
								/>
								<div class="mt">
									<h2>{$lang('stream') || 'Stream'}</h2>
									<div class="button-container">
										<button
											class:selected={selectedCamera.stream !== false}
											on:click={() => updateRow(selectedCamera.id, { stream: true })}
											use:Ripple={$ripple}
										>
											{$lang('yes')}
										</button>
										<button
											class:selected={selectedCamera.stream === false}
											on:click={() => updateRow(selectedCamera.id, { stream: false })}
											use:Ripple={$ripple}
										>
											{$lang('no')}
										</button>
									</div>
								</div>
								<h2>{$lang('preview')}</h2>
								<div class="preview">
									<RowCamera row={selectedCamera} configMode={true} />
								</div>

								<!-- BUTTONS config -->
							{:else if selectedButtons}
								<h2>{$lang('buttons')}</h2>

								<h2>{$lang('columns') || 'Columns'}</h2>
								<div class="button-container">
									{#each [1, 2, 3, 4] as n}
										<button
											class:selected={(selectedButtons.columns ?? 2) === n}
											on:click={() => updateRow(selectedButtons.id, { columns: n })}
											use:Ripple={$ripple}
										>
											{n}
										</button>
									{/each}
								</div>

								<h2>{$lang('buttons') || 'Buttons'}</h2>
								{#if (selectedButtons.items ?? []).length === 0}
									<p class="no-rows">{$lang('no_buttons')}</p>
								{:else}
									{#each selectedButtons.items ?? [] as btn (btn.id)}
										<ButtonConfigRow
											{btn}
											on:change={(e) =>
												updateButton(selectedButtons.id, e.detail.id, {
													entity_id: e.detail.entity_id
												})}
											on:remove={(e) => removeButton(selectedButtons.id, e.detail)}
										/>
									{/each}
								{/if}

								<button
									class="action done mt"
									on:click={() => addButton(selectedButtons.id)}
									use:Ripple={$ripple}
								>
									+ {$lang('add_button') || 'Add button'}
								</button>

								<h2>{$lang('preview')}</h2>
								<div class="preview">
									<RowButtons row={selectedButtons} configMode={true} />
								</div>

								<!-- SENSOR config -->
							{:else if selectedSensor}
								<h2>{$lang('entity') || 'Entity'}</h2>
								<Select
									options={allEntities}
									placeholder={$lang('entity')}
									value={selectedSensor.entity_id}
									computeIcons={true}
									on:change={(e) => updateRow(selectedSensor.id, { entity_id: e.detail })}
								/>
								<h2>{$lang('name')} <small>({$lang('optional') || 'optional'})</small></h2>
								<input
									class="input"
									type="text"
									value={selectedSensor.name ?? ''}
									placeholder={$lang('auto') || 'auto'}
									on:input={handleSensorName}
								/>
								<div class="row-two mt">
									<div>
										<h2>{$lang('before')}</h2>
										<input
											class="input"
											type="text"
											value={selectedSensor.prefix ?? ''}
											placeholder={$lang('before')}
											on:input={handleSensorPrefix}
										/>
									</div>
									<div>
										<h2>{$lang('after')}</h2>
										<input
											class="input"
											type="text"
											value={selectedSensor.suffix ?? ''}
											placeholder={$lang('after')}
											on:input={handleSensorSuffix}
										/>
									</div>
								</div>
								<h2>{$lang('preview')}</h2>
								<div class="preview">
									<RowSensor row={selectedSensor} configMode={true} />
								</div>

								<!-- SLIDER config -->
							{:else if selectedSlider}
								<h2>{$lang('slider')}</h2>
								<Select
									options={allEntities}
									placeholder={$lang('entity')}
									value={selectedSlider.entity_id}
									computeIcons={true}
									on:change={(e) => updateRow(selectedSlider.id, { entity_id: e.detail })}
								/>
								<h2>{$lang('name')} <small>({$lang('optional') || 'optional'})</small></h2>
								<input
									class="input"
									type="text"
									value={selectedSlider.name ?? ''}
									placeholder={$lang('auto') || 'auto'}
									on:input={handleSliderName}
								/>
								{#if sliderNeedsWarning(selectedSlider.entity_id)}
									<p class="degradation-hint">
										<Icon icon="mdi:information-outline" height="0.9rem" />
										{$lang('slider_degradation')}
									</p>
								{/if}
								<h2>{$lang('preview')}</h2>
								<div class="preview">
									<RowSlider row={selectedSlider} configMode={true} />
								</div>
							{/if}
						</div>
					{/key}
				{:else}
					<p class="no-rows">{$lang('configure_row')}</p>
				{/if}
			</div>
		</div>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	.editor-layout {
		display: grid;
		grid-template-columns: 14rem 1fr;
		gap: 1.5rem;
		margin-top: 1rem;
		min-height: 22rem;
		overflow: visible;
	}

	.row-list-panel {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		padding-right: 1rem;
	}

	.panel-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.45;
		margin: 0 0 0.2rem 0;
	}

	.row-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.6rem;
		border-radius: 0.5rem;
		cursor: pointer;
		background-color: transparent;
		transition: background-color 150ms ease;
		user-select: none;
	}

	.row-item:hover {
		background-color: rgba(255, 255, 255, 0.06);
	}

	.row-item.selected {
		background-color: rgba(255, 255, 255, 0.12);
	}

	.row-type-icon {
		display: flex;
		opacity: 0.7;
		flex-shrink: 0;
	}

	.row-type-label {
		flex: 1;
		font-size: 0.85rem;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.row-type-label small {
		display: block;
		opacity: 0.5;
		font-size: 0.7rem;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.drag-handle {
		display: flex;
		opacity: 0.3;
		cursor: grab;
		flex-shrink: 0;
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

	.no-rows {
		opacity: 0.4;
		font-size: 0.85rem;
		margin: 0.5rem 0;
	}

	.add-row-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 0.8rem;
	}

	.add-row-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		padding: 0.5rem 0.3rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 0.5rem;
		background: transparent;
		color: white;
		font-family: inherit;
		font-size: 0.78rem;
		cursor: pointer;
		transition: background-color 150ms ease;
		position: relative;
		overflow: hidden;
	}

	.add-row-btn:hover {
		background-color: rgba(255, 255, 255, 0.08);
	}

	.row-config-panel {
		padding-left: 0.5rem;
		overflow: visible;
	}

	.preview {
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.6rem;
	}

	.degradation-hint {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: #ffb347;
		margin: 0.5rem 0;
		opacity: 0.85;
	}

	.row-two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}

	.mt {
		margin-top: 0.8rem;
	}

	.icon-gallery-container {
		display: flex;
		gap: 0.4rem;
	}

	.icon-gallery-container :global(.clear) {
		flex: 1;
	}

	.icon-gallery {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.06);
		border: none;
		border-radius: 0.5rem;
		color: inherit;
		cursor: pointer;
		flex-shrink: 0;
		padding: 0.84rem;
		position: relative;
		overflow: hidden;
	}

	.icon-gallery:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	select.input {
		width: 100%;
		color-scheme: dark;
	}

	@media (max-width: 600px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}

		.row-list-panel {
			border-right: none;
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			padding-right: 0;
			padding-bottom: 1rem;
		}
	}
</style>
