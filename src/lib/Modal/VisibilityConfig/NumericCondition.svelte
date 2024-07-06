<script lang="ts">
	import { lang, entityList } from '$lib/Stores';
	import Select from '$lib/Components/Select.svelte';
	import type { Condition } from '$lib/Types';

	export let item: Condition;
	export let items: Condition[];

	$: entityOptions = $entityList('');

	/**
	 * Updates `entity` value
	 */
	function handleEntity(id: number | undefined, entity_id: string) {
		items = items.map((condition: Condition) => {
			if (id === condition.id) {
				return { ...condition, entity: entity_id };
			}
			return condition;
		});
	}

	/**
	 * Updates `above` or `below` value
	 */
	function handleRange(id: number | undefined, target: EventTarget | null, key: 'above' | 'below') {
		const input = target as HTMLInputElement;
		const value = input.value;

		items = items.map((condition: Condition) => {
			if (id === condition.id) {
				// delete key ef empty
				if (value === '') {
					const _condition = { ...condition };
					delete _condition[key];
					return _condition;
				} else {
					return { ...condition, [key]: Number(value) };
				}
			}
			return condition;
		});
	}
</script>

<Select
	options={entityOptions}
	placeholder={$lang('entity')}
	value={item.entity}
	on:change={(event) => handleEntity(item?.id, event?.detail)}
	computeIcons={true}
	defaultIcon={'mdi:state-machine'}
/>

<br />

<div>
	<span>
		<input
			data-modal
			type="number"
			value={item?.above !== undefined ? item.above : ''}
			on:input={(event) => handleRange(item?.id, event?.target, 'above')}
			placeholder={$lang('above')}
			autocomplete="off"
		/>
	</span>

	<span>
		<input
			data-modal
			type="number"
			value={item?.below !== undefined ? item.below : ''}
			on:input={(event) => handleRange(item?.id, event?.target, 'below')}
			placeholder={$lang('below')}
			autocomplete="off"
		/>
	</span>
</div>

<style>
	div {
		display: flex;
		width: 100%;
		gap: 1rem;
	}

	span {
		width: 50%;
	}

	input[type='number'] {
		color-scheme: dark;
		margin-right: 2rem;
	}
</style>
