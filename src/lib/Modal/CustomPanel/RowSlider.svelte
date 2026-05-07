<script lang="ts">
	import { states, connection } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import { getDomain, getTogglableService } from '$lib/Utils';
	import Toggle from '$lib/Components/Toggle.svelte';
	import Icon from '@iconify/svelte';
	import type { ModalRowSlider } from '$lib/Types';

	export let row: ModalRowSlider;
	export let configMode = false;

	// Bitmasks for media_player and cover (HA 2025.x enum values).
	// Source: homeassistant/components/media_player/const.py, cover/__init__.py
	const MEDIA_PLAYER_VOLUME_SET = 4;  // MediaPlayerEntityFeature.VOLUME_SET
	const COVER_SET_POSITION = 4;       // CoverEntityFeature.SET_POSITION

	$: entity = row?.entity_id ? $states[row.entity_id] : undefined;
	$: domain = getDomain(row?.entity_id);
	$: attributes = entity?.attributes ?? {};
	$: name = row?.name || attributes?.friendly_name || row?.entity_id || '—';
	$: supported_features = attributes?.supported_features ?? 0;

	// Light: uses supported_color_modes (HA 2025.x API; magic-number brightness removed in 2025.1).
	// Ref: developers.home-assistant.io/docs/core/entity/light/
	type RenderMode = 'brightness' | 'volume' | 'cover' | 'input_number' | 'toggle' | 'readonly' | 'missing';

	$: renderMode = ((): RenderMode => {
		if (!row?.entity_id) return 'missing';
		if (!entity && !configMode) return 'missing';

		switch (domain) {
			case 'light': {
				const modes = Array.isArray(attributes?.supported_color_modes)
					? attributes.supported_color_modes
					: [attributes?.supported_color_modes].filter(Boolean);

				const supportsBrightness = modes?.some((m: string) =>
					['brightness', 'color_temp', 'hs', 'xy', 'rgb', 'rgbw', 'rgbww', 'white'].includes(m)
				);

				return supportsBrightness ? 'brightness' : 'toggle';
			}
			case 'media_player':
				return supported_features & MEDIA_PLAYER_VOLUME_SET ? 'volume' : 'toggle';
			case 'cover':
				return supported_features & COVER_SET_POSITION ? 'cover' : 'toggle';
			case 'input_number':
				return 'input_number';
			case 'switch':
			case 'input_boolean':
			case 'fan':
			case 'automation':
				return 'toggle';
			default:
				return 'readonly';
		}
	})();

	// Slider values
	$: sliderValue = (() => {
		if (renderMode === 'brightness') return Math.round((attributes?.brightness ?? 0) / 2.55);
		if (renderMode === 'volume') return Math.round((attributes?.volume_level ?? 0) * 100);
		if (renderMode === 'cover') return attributes?.current_position ?? 0;
		if (renderMode === 'input_number') return Number(entity?.state ?? attributes?.min ?? 0);
		return 0;
	})();

	$: sliderMin = renderMode === 'input_number' ? (attributes?.min ?? 0) : 0;
	$: sliderMax = renderMode === 'input_number' ? (attributes?.max ?? 100) : 100;
	$: sliderStep = renderMode === 'input_number' ? (attributes?.step ?? 1) : 1;

	$: toggleChecked = entity
		? ['on', 'active', 'open', 'unlocked', 'cleaning', 'playing'].includes(entity.state)
		: false;

	function handleSlider(event: Event) {
		if (configMode || !entity) return;
		const value = Number((event.target as HTMLInputElement).value);

		switch (renderMode) {
			case 'brightness':
				callService($connection, 'light', 'turn_on', {
					entity_id: row.entity_id,
					brightness_pct: value
				});
				break;
			case 'volume':
				callService($connection, 'media_player', 'volume_set', {
					entity_id: row.entity_id,
					volume_level: value / 100
				});
				break;
			case 'cover':
				callService($connection, 'cover', 'set_cover_position', {
					entity_id: row.entity_id,
					position: value
				});
				break;
			case 'input_number':
				callService($connection, 'input_number', 'set_value', {
					entity_id: row.entity_id,
					value
				});
				break;
		}
	}

	function handleToggle() {
		if (configMode || !entity) return;
		const service = getTogglableService(entity);
		if (!service) return;
		const [svcDomain, svcName] = service.includes('.')
			? service.split('.')
			: [domain!, service];
		callService($connection, svcDomain, svcName, { entity_id: row.entity_id });
	}
</script>

{#if renderMode !== 'missing'}
	<div class="row-slider">
		<span class="slider-name">{name}</span>

		<div class="slider-control">
			{#if renderMode === 'toggle'}
				<Toggle bind:checked={toggleChecked} on:change={handleToggle} />

			{:else if renderMode === 'readonly'}
				<span class="state-badge">{entity?.state ?? '—'}</span>

			{:else}
				<div class="slider-wrap">
					{#if renderMode === 'brightness'}
						<Icon icon="mdi:brightness-6" height="1rem" />
					{:else if renderMode === 'volume'}
						<Icon icon="mdi:volume-high" height="1rem" />
					{:else if renderMode === 'cover'}
						<Icon icon="mdi:window-shutter" height="1rem" />
					{/if}
					<input
						type="range"
						min={sliderMin}
						max={sliderMax}
						step={sliderStep}
						value={sliderValue}
						disabled={configMode}
						on:change={handleSlider}
					/>
					<span class="slider-val">
						{sliderValue}{renderMode === 'input_number' ? '' : '%'}
					</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.row-slider {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		gap: 1rem;
	}

	.row-slider:last-child {
		border-bottom: none;
	}

	.slider-name {
		font-size: 0.9rem;
		opacity: 0.75;
		flex-shrink: 0;
		max-width: 45%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.slider-control {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-end;
	}

	.slider-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		justify-content: flex-end;
	}

	input[type='range'] {
		flex: 1;
		max-width: 10rem;
		accent-color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
	}

	input[type='range']:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.slider-val {
		font-size: 0.85rem;
		opacity: 0.6;
		min-width: 2.5rem;
		text-align: right;
	}

	.state-badge {
		font-size: 0.9rem;
		opacity: 0.6;
		font-style: italic;
	}
</style>
