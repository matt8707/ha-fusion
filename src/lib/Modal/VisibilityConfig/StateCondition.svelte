<script lang="ts">
	import { lang, entityList } from '$lib/Stores';
	import Select from '$lib/Components/Select.svelte';
	import type { Condition } from '$lib/Types';

	export let item: Condition;
	export let items: Condition[];
	export let isItemTemplate: boolean = false;

	$: entityOptions = isItemTemplate 
		? [
				{ id: '{item.entity_id}', label: '{item.entity_id} (placeholder)' },
				...$entityList('')
			]
		: $entityList('');

	const stateOptions = [
		{ id: 'state', label: $lang('state_equal') },
		{ id: 'state_not', label: $lang('state_not_equal') }
	];

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
	 * Updates `state` or `state_not` keys
	 */
	function handleEquals(id: number | undefined, key: string) {
		items = items.map((condition: Condition) => {
			if (id === condition.id) {
				const _condition = { ...condition };

				if (key === 'state_not') {
					delete _condition.state;
				} else {
					delete _condition.state_not;
				}

				return {
					..._condition,
					[key]: condition.state_not || condition.state
				};
			}
			return condition;
		});
	}

	/**
	 * Updates `state` value
	 */
	function handleState(id: number | undefined, target: EventTarget | null) {
		const input = target as HTMLInputElement;

		items = items.map((condition: Condition) => {
			if (id === condition.id) {
				if ('state_not' in condition) {
					return { ...condition, state_not: input.value };
				} else {
					return { ...condition, state: input.value };
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
		<Select
			options={stateOptions}
			value={'state_not' in item ? 'state_not' : 'state'}
			placeholder={$lang('state_not' in item ? 'state_not_equal' : 'state_equal')}
			on:change={(event) => handleEquals(item?.id, event?.detail)}
		/>
	</span>

	<span>
		<input
			data-modal
			type="text"
			value={item?.state || item?.state_not || ''}
			placeholder={$lang('state')}
			on:input={(event) => handleState(item?.id, event?.target)}
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
</style>
