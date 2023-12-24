<script lang="ts">
	import { lang, selectHover } from '$lib/Stores';
	import { onMount, onDestroy, tick } from 'svelte';
	import Svelecte from 'svelecte';
	import SelectItem from '$lib/Components/SelectItem.svelte';
	import { createEventDispatcher } from 'svelte';

	export let options: any;
	export let placeholder: string;
	export let value: string | undefined;
	export let customItems = false;

	let container: HTMLDivElement;
	let clearable = false;
	let dropdownOpen = false;

	let observer: MutationObserver;
	let dropdownObserver: MutationObserver;

	$: if (!dropdownOpen) $selectHover = undefined;

	const dispatch = createEventDispatcher();

	const i18n = {
		empty: $lang('no_entities'),
		nomatch: $lang('nothing_found')
	};

	const style = `
    --sv-bg: rgba(0, 0, 0, 0.2);
    --sv-border-color: rgba(255, 255, 255, 0.3);
    --sv-item-color: inherit;
    --sv-item-active-bg: #3f4042;
    --sv-highlight-bg: rgba(255, 222, 0, 0.4);
		--sv-dropdown-height: 19rem;
		--sv-placeholder-color: rgba(255, 255, 255, 0.6);
  `;

	/**
	 * Observe parent '.svelecte' for the addition of '.sv-dropdown'.
	 * Then observe '.sv-dropdown' for changes to 'aria-expanded'.
	 * Set `dropdownOpen` based on observed 'aria-expanded'.
	 */
	onMount(() => {
		const _svelecte = container?.querySelector('.svelecte');
		if (!_svelecte) return;

		observer = new MutationObserver((mutations) => {
			const _dropdown = mutations
				.flatMap((m) => Array.from(m.addedNodes))
				.find((node) => node instanceof Element && node.matches('.sv-dropdown')) as Element;
			if (!_dropdown) return;

			dropdownOpen = _dropdown.getAttribute('aria-expanded') === 'true';

			dropdownObserver = new MutationObserver((attrMutations) => {
				attrMutations.forEach(({ type, attributeName, target }) => {
					if (type === 'attributes' && attributeName === 'aria-expanded') {
						dropdownOpen = (target as Element).getAttribute('aria-expanded') === 'true';
					}
				});
			});
			dropdownObserver.observe(_dropdown, { attributes: true });

			observer.disconnect();
		});

		observer.observe(_svelecte, { childList: true });

		// fix chrome warning on svelecte
		const input = container?.querySelector('.sv-control > .sv-content > input');
		if (input) input.setAttribute('autocomplete', 'off');
	});

	onDestroy(() => {
		observer?.disconnect();
		dropdownObserver?.disconnect();
	});

	async function handleChange(event: any) {
		if (event?.detail?.id) {
			dispatch('change', event.detail.id);
			await tick();
			$selectHover = undefined;

			// blur input on select
			(container?.querySelector('#select') as HTMLElement)?.blur();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// svelecte blocks page refresh shortcut when input is focused...
		if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
			location.reload();
		}

		// arrow keys
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			setTimeout(() => {
				const position = container?.querySelector('.sv-dd-item-active')?.getAttribute('data-pos');
				if (position) $selectHover = options?.[position]?.id;
			}, 0);
		}
	}

	// on:pointermove={handleEvent}

	// function handleEvent(event: MouseEvent) {
	// 	if (!dropdownOpen) return;
	// 	const target = event.target as HTMLElement;
	// 	if (target.classList.contains('sv-item-content')) {
	// 		$selectHover = target.innerText;
	// 	}
	// }
</script>

<svelte:window on:keydown|capture={handleKeydown} />

<div bind:this={container}>
	{#if !customItems}
		<Svelecte
			bind:value
			on:change={handleChange}
			{style}
			{options}
			{clearable}
			{placeholder}
			{i18n}
			name="select"
			inputId="select"
		/>
	{:else}
		<Svelecte
			bind:value
			on:change={handleChange}
			{style}
			{options}
			{clearable}
			{placeholder}
			{i18n}
			controlItem={SelectItem}
			dropdownItem={SelectItem}
			name="select"
			inputId="select"
		/>
	{/if}

	<style>
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
