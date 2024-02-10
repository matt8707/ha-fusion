<script lang="ts">
	import { lang } from '$lib/Stores';
	import { onMount, tick } from 'svelte';
	import Svelecte from 'svelecte';
	import SelectItem from '$lib/Components/SelectItem.svelte';
	import { createEventDispatcher } from 'svelte';

	export let options: any;
	export let placeholder: string;
	export let value: string | undefined;
	export let customItems = false;
	export let clearable: boolean = false;
	export let keepFocus: boolean = true;

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
		if (keepFocus && value === undefined) return;

		// dispatch to parent component
		dispatch('change', value);

		// Component re-render to fix virtualList rendering
		// https://github.com/mskocik/svelecte/issues/196
		// await tick to fix `TypeError: scrollContainer is null`
		await tick();
		await tick();
		key = !key;

		const active = document?.activeElement;
		if (active instanceof HTMLInputElement) {
			value !== undefined ? active.blur() : active.focus();
		}
	}

	const props = {
		name: 'select',
		inputId: 'select',
		virtualList: true,
		vlHeight: 450,
		vlItemSize: customItems ? 45 : 35,
		clearable,
		placeholder,
		options,
		controlItem: customItems ? SelectItem : undefined,
		dropdownItem: customItems ? SelectItem : undefined,
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
		--sv-dropdown-height: 462px;
		--sv-placeholder-color: rgba(255, 255, 255, 0.6);
  `
	};
</script>

<div bind:this={container}>
	{#key key}
		<Svelecte bind:value on:change={handleChange} {...props} />
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

			/* circumvent modal 'overflow: hidden' */
			/* position: fixed !important;
			width: 26.2rem !important;
			z-index: 3; */
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

		.inputBox {
			margin: 0 !important;
		}
	</style>
</div>
