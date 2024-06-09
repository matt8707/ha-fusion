<script lang="ts">
	import ComputeIcon from '$lib/Components/ComputeIcon.svelte';
	import { motion } from '$lib/Stores';
	import { tick } from 'svelte';
	import VirtualList, { type Alignment, type ScrollBehaviour } from 'svelte-tiny-virtual-list';
	import { scale, slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import { expoOut } from 'svelte/easing';

	export let value: string | undefined;
	export let placeholder: string;
	export let computeIcons: boolean | undefined = undefined;
	export let getIconString: boolean | undefined = undefined;
	export let defaultIcon: string | undefined = undefined;
	export let clearable: boolean | undefined = undefined;
	export let options: {
		id: string;
		label: string;
		hint?: string;
		icon?: string;
	}[];

	const DEBUG = false;

	let listOpen = false;
	let search: string;
	let wrapper: HTMLDivElement;
	let input: HTMLInputElement;
	let selectedIndex: number;

	let highlightedIndex = 0;
	let scrollToIndex = 0;
	let scrollToAlignment: Alignment = 'auto';

	const scrollToBehaviour: ScrollBehaviour = 'instant';
	const itemSize = 50;
	const maxHeight = itemSize * 7;
	const overscanCount = 7;

	const dispatch = createEventDispatcher();

	$: if ((value === undefined && clearable) || value) {
		dispatch('change', value);
	}

	$: if (!listOpen) {
		search = '';
		selectedIndex = options?.findIndex((option: { id: string }) => option.id === value);
	}

	$: height = filter && Math.min(filter.length * itemSize, maxHeight);

	$: filter =
		options && listOpen
			? options.filter(
					(option: { id: string; label: string }) =>
						!search ||
						option.label.toLowerCase().includes(search.toLowerCase()) ||
						option.id.toLowerCase().includes(search.toLowerCase())
				)
			: [];

	$: itemCount = filter?.length;

	$: inputProps = {
		type: 'text',
		class: 'input',
		placeholder,
		style: `padding-left: ${options?.[selectedIndex]?.icon || computeIcons ? '3.1rem' : '1rem'}`
	};

	function handleKeydown(event: any) {
		if (!listOpen) return;

		// up
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedIndex = Math.max(highlightedIndex - 1, 0);
			scrollToIndex = highlightedIndex;
		}

		// down
		else if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedIndex = Math.min(highlightedIndex + 1, filter.length - 1);
			scrollToIndex = highlightedIndex;
		}

		// enter
		else if (event.key === 'Enter') {
			if (highlightedIndex >= 0 && highlightedIndex < filter.length) {
				value = filter?.[highlightedIndex]?.id;
			}
			listOpen = false;
			if (input) input?.blur();
		}

		// escape
		else if (event.key === 'Escape') {
			event.stopPropagation();
			listOpen = false;
			if (input) input?.blur();
		}

		// tab
		else if (event.key === 'Tab') {
			listOpen = false;
		}
	}

	async function handleFocus() {
		// lookup index
		listOpen = true;
		await tick();
		const index = filter.findIndex((option: { id: string }) => option.id === value);

		// highlight index, align to 'start'
		if (index !== -1) {
			scrollToAlignment = 'start';
			highlightedIndex = index;
			scrollToIndex = highlightedIndex;
		}

		// reset alignment
		await tick();
		scrollToAlignment = 'auto';
	}

	function handlePointerDown(event: PointerEvent) {
		if (listOpen && wrapper && !wrapper.contains(event.target as Node) && event.target !== input) {
			listOpen = false;
		}
	}
</script>

<svelte:window on:pointerdown={handlePointerDown} on:keydown|capture={handleKeydown} />

{#if DEBUG}
	<code style:color="#dfdf00">
		highlightedIndex: {highlightedIndex} <br />
		filter.length: {filter.length} <br />
		value: {value} <br />
		listOpen: {listOpen} <br />
		<br />
	</code>
{/if}

<div class="container">
	<div class="icon">
		{#if computeIcons && value}
			<!-- key value to properly update getIconString? -->
			{#key value}
				<ComputeIcon entity_id={value} {getIconString} on:iconString />
			{/key}
		{:else if options?.[selectedIndex]?.icon}
			<Icon icon={String(options?.[selectedIndex]?.icon)} height="none" />
		{:else if !value && defaultIcon}
			<Icon icon={defaultIcon} height="none" />
		{/if}
	</div>

	{#if listOpen || !value || !clearable}
		<button
			class:chevron={!listOpen}
			class="icon close"
			style:transform={listOpen ? 'scaleY(-1)' : 'none'}
			style:transition="transform {$motion / 1.5}ms ease"
			transition:scale={{ duration: $motion }}
		>
			<Icon icon="octicon:chevron-down-12" height="none" />
		</button>
	{:else if value && clearable}
		<button
			class="icon close"
			on:click={() => {
				value = undefined;
			}}
			transition:scale={{ duration: $motion }}
		>
			<Icon icon="mingcute:close-fill" height="none" />
		</button>
	{/if}

	{#if listOpen}
		<input
			bind:value={search}
			bind:this={input}
			on:focus={handleFocus}
			on:input={() => {
				highlightedIndex = 0;
				scrollToIndex = highlightedIndex;
			}}
			{...inputProps}
		/>
	{:else}
		<!-- only to display label -->
		<input
			value={options?.[selectedIndex]?.label || ''}
			on:focus={async () => {
				listOpen = true;
				await tick();
				input?.focus();
			}}
			{...inputProps}
		/>
	{/if}
</div>

{#if listOpen && filter}
	<div
		class="wrapper"
		bind:this={wrapper}
		in:slide={{ duration: $motion * 1.5, easing: expoOut }}
		out:slide={{ duration: $motion, easing: expoOut }}
	>
		<VirtualList
			width="100%"
			{itemSize}
			{height}
			{itemCount}
			{scrollToIndex}
			{scrollToAlignment}
			{scrollToBehaviour}
			{overscanCount}
		>
			<button
				slot="item"
				let:index
				let:style
				{style}
				on:pointerenter={() => {
					highlightedIndex = index;
				}}
				on:click={() => {
					value = filter?.[index]?.id;
					listOpen = false;
					if (input) input?.blur();
				}}
			>
				<div
					class="item"
					class:highlighted={index === highlightedIndex}
					class:selected={value === filter?.[index]?.id}
				>
					{#if filter?.[index]?.icon || computeIcons}
						<div class="item-icon">
							{#if filter?.[index]?.icon}
								<Icon icon={String(filter?.[index]?.icon)} height="none" />
							{:else if computeIcons}
								<ComputeIcon entity_id={filter?.[index]?.id} />
							{/if}
						</div>
					{/if}

					<div class="label">
						{filter?.[index]?.label}
						{#if filter?.[index]?.hint}
							<span class="name">
								{filter?.[index]?.hint}
							</span>
						{/if}
					</div>
				</div>
			</button>
		</VirtualList>
	</div>
{/if}

<style>
	.container {
		position: relative;
	}

	.icon {
		display: flex;
		position: absolute;
		height: 3.3rem;
		width: 3.3rem;
		align-items: center;
		padding: 1.05rem;
		margin-top: -1px;
		background: none;
		border: none;
		color: lightgrey;
	}

	.chevron {
		right: 0;
		pointer-events: none;
	}

	.close {
		right: 0;
		cursor: pointer;
	}

	.input {
		padding-right: 3rem !important;
	}

	/* list */

	.wrapper {
		margin-top: 0.2rem;
		position: relative;
		background-color: #1d1b18;
		border-radius: 0.6rem;
		overflow: hidden;
	}

	[slot='item'] {
		all: unset;
	}

	.highlighted {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.selected {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.item {
		display: flex;
		align-items: center;
		padding-left: 1rem;
		cursor: pointer;
		gap: 0.9rem;
		font-size: 0.95rem;
		height: 100%;
	}

	.item-icon {
		display: flex;
		align-items: center;
		width: 1.28rem;
		height: 1.28rem;
	}

	.label {
		display: grid;
		gap: 0.2rem;
		overflow: hidden;
	}

	.name {
		font-size: 0.8rem;
		opacity: 0.4;
		margin-top: -1px;
	}
</style>
