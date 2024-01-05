<script lang="ts">
	import RangeSlider from '$lib/Components/RangeSlider.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { connection, lang, selectedLanguage, states } from '$lib/Stores';
	import { getName, getSupport } from '$lib/Utils';
	import {
		callService,
		type HassEntity,
		type HassEntityAttributeBase
	} from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let selected: any;

	// https://github.com/home-assistant/frontend/blob/dev/src/data/fan.ts
	const enum Feature {
		SET_SPEED = 1,
		OSCILLATE = 2,
		DIRECTION = 4,
		PRESET_MODE = 8
	}

	interface FanEntityAttributes extends HassEntityAttributeBase {
		direction?: string;
		oscillating?: boolean;
		percentage?: number;
		percentage_step?: number;
		preset_mode?: string;
		preset_modes?: string[];
	}

	interface FanEntity extends HassEntity {
		state: string;
		attributes: FanEntityAttributes;
	}

	let request: Promise<unknown> | undefined = undefined;

	$: entity = $states[selected?.entity_id] as FanEntity;
	$: attributes = entity?.attributes;

	$: percentage = attributes?.percentage;
	$: supportsSetSpeed = getSupport(attributes, Feature.SET_SPEED);

	async function handleChange(service: string, attribute: string, position: number) {
		if (request) return;

		request = callService($connection, 'fan', service, {
			entity_id: entity?.entity_id,
			[attribute]: position
		});

		try {
			await request;
		} catch (error) {
			console.error(`Failed to set fan ${attribute}:`, error);
		} finally {
			request = undefined;
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(selected, entity)}</h1>
		{#if supportsSetSpeed && percentage !== undefined}
			<h2>
				<span class="align-right">
					{#if percentage === 0}
						{$lang('off')}
					{:else}
						{Intl.NumberFormat($selectedLanguage, { style: 'percent' }).format(percentage / 100)}
					{/if}
				</span>
			</h2>

			<RangeSlider
				value={percentage}
				min={0}
				max={100}
				on:change={(event) => {
					request = undefined;
					handleChange('set_percentage', 'percentage', Math.round(event?.detail));
				}}
			/>
		{/if}
	</Modal>
{/if}
