<script lang="ts">
	import { lang } from '$lib/Stores';
	import { onMount } from 'svelte';
	import Svelecte from 'svelecte';
	import SelectItem from '$lib/Components/SelectItem.svelte';
	import { createEventDispatcher } from 'svelte';

	export let options: any;
	export let placeholder: string;
	export let value: string | undefined;
	export let customItems = false;
	export let clearable: boolean = false;

	let container: HTMLDivElement;
	let key = false;

	const dispatch = createEventDispatcher();

	onMount(() => {
		// fix chrome warning on svelecte
		const input = container?.querySelector('.sv-control > .sv-content > input');
		if (input) input.setAttribute('autocomplete', 'off');
	});

	/**
	 * Handle select changes
	 */
	async function handleChange(event: any) {
		const value = event?.detail?.id;

		// dispatch to parent component
		dispatch('change', value);

		// key
		// trigger();

		const active = document?.activeElement;
		if (value !== undefined) (active as HTMLInputElement)?.blur();

		// blur input on:change otherwise have to click twice
		// const element = container?.querySelector('#select') as HTMLElement;
		// element?.blur();

		// if (value === undefined) active?.focus();
	}

	/**
	 * Component re-render to fix virtualList rendering
	 * https://github.com/mskocik/svelecte/issues/196
	 */
	// async function trigger() {
	// 	// fix `TypeError: scrollContainer is null`
	// 	await tick();
	// 	await tick();
	// 	// key change triggers rerender

	// 	key = !key;
	// }

	const props = {
		name: 'select',
		inputId: 'select',
		virtualList: true,
		clearable,
		i18n: {
			empty: $lang('no_entities'),
			nomatch: $lang('nothing_found')
		},
		style: `
    --sv-bg: rgba(0, 0, 0, 0.2);
    --sv-border-color: rgba(255, 255, 255, 0.3);
    --sv-item-color: inherit;
    --sv-item-active-bg: #3f4042;
    --sv-highlight-bg: rgba(255, 222, 0, 0.4);
		--sv-dropdown-height: 413px;
		--sv-placeholder-color: rgba(255, 255, 255, 0.6);
  `
	};
</script>

<div bind:this={container}>
	{#key key}
		{#if customItems}
			<Svelecte
				bind:value
				on:change={handleChange}
				{options}
				{placeholder}
				controlItem={SelectItem}
				dropdownItem={SelectItem}
				{...props}
			/>
		{:else}
			<Svelecte bind:value on:change={handleChange} {options} {placeholder} {...props} />
		{/if}
	{/key}

	<style>
		/* override styles */

		.sv-control:focus {
			outline: 1px solid yellow;
		}

		.sv-control {
			border-radius: 0.6em !important;
			width: 100%;
			height: 3.2rem;
		}

		.sv-content {
			padding: 0.9rem !important;
		}

		.sv-dropdown {
			border-radius: 0.6rem !important;
			background-color: #1d1b18 !important;
			margin-top: -1px !important;
		}

		.sv-dropdown-scroll {
			padding: 0.4rem !important;
		}

		.sv-dropdown-content > .sv-dd-item > .sv-item {
			transition: background-color 100ms ease;
			border-radius: 0.38rem !important;
		}

		.sv-dropdown-content > .sv-dd-item-active > .sv-item {
			background-color: rgba(255, 255, 255, 0.1) !important;
			transition: background-color 100ms ease;
			border-radius: 0.38rem !important;
		}

		.sv-dropdown-content > .sv-dd-item {
			font-size: 1rem !important;
			color: #e8eaed !important;
		}

		.sv-dropdown-content .sv-item-content {
			padding: 0.3rem !important;
		}
	</style>
</div>
