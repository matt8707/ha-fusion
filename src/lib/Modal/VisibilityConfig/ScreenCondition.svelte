<script lang="ts">
	import { lang } from '$lib/Stores';
	import type { Condition } from '$lib/Types';
	import { onMount } from 'svelte';

	export let item: Condition;
	export let items: Condition[];

	// mobile: "(min-width: 0px) and (max-width: 767px)"
	// tablet: "(min-width: 768px) and (max-width: 1023px)"
	// desktop: "(min-width: 1024px) and (max-width: 1279px)"
	// wide: "(min-width: 1280px)"
	// mobile + tablet: "(min-width: 0px) and (max-width: 1023px)"
	// mobile + desktop: "(min-width: 0px) and (max-width: 767px), (min-width: 1024px) and (max-width: 1279px)"
	// mobile + wide: "(min-width: 0px) and (max-width: 767px), (min-width: 1280px)"
	// tablet + desktop: "(min-width: 768px) and (max-width: 1279px)"
	// tablet + wide: "(min-width: 768px) and (max-width: 1023px), (min-width: 1280px)"
	// desktop + wide: "(min-width: 1024px)"
	// mobile + tablet + desktop: "(min-width: 0px) and (max-width: 1279px)"
	// mobile + tablet + wide: "(min-width: 0px) and (max-width: 1023px), (min-width: 1280px)"
	// mobile + desktop + wide: "(min-width: 0px) and (max-width: 767px), (min-width: 1024px)"
	// tablet + desktop + wide: "(min-width: 768px)"
	// mobile + tablet + desktop + wide: "(min-width: 0px)"

	let mobile = false;
	let tablet = false;
	let desktop = false;
	let wide = false;

	let input = item?.media_query;

	const breakpoints: {
		[key: string]: {
			min: number;
			max: number;
		};
	} = {
		mobile: { min: 0, max: 767 },
		tablet: { min: 768, max: 1023 },
		desktop: { min: 1024, max: 1279 },
		wide: { min: 1280, max: Infinity }
	};

	$: if (typeof input === 'string') {
		handleChange();
	}

	function handleChange() {
		items = items.map((condition: Condition) =>
			condition.id === item.id ? { ...condition, media_query: input } : condition
		);
	}

	onMount(() => handleInput());

	/**
	 * Handles input text field
	 */
	function handleInput(): void {
		if (!input?.trim()) {
			mobile = tablet = desktop = wide = false;
			return;
		}

		const result = parseMediaQuery(input);

		const generatedQuery = generateMediaQuery(
			result.mobile,
			result.tablet,
			result.desktop,
			result.wide
		);

		if (input === generatedQuery) {
			({ mobile, tablet, desktop, wide } = result);
		} else {
			mobile = tablet = desktop = wide = false;
		}
	}

	/**
	 * Handles checkbox click
	 */
	function handleClick() {
		input = generateMediaQuery(mobile, tablet, desktop, wide);
	}

	/**
	 * Generates a media query string based on selected checkboxes
	 */
	function generateMediaQuery(m: boolean, t: boolean, d: boolean, w: boolean): string {
		const selected = [m && 'mobile', t && 'tablet', d && 'desktop', w && 'wide'].filter(
			Boolean
		) as string[];
		if (selected.length === 0) return '';
		if (selected.length === 4) return '(min-width: 0px)';

		const ranges: string[] = [];
		let currentMin: number | null = null;
		let currentMax: number | null = null;

		for (const bp of Object.keys(breakpoints) as Array<keyof typeof breakpoints>) {
			if (selected.includes(bp as string)) {
				currentMin = currentMin ?? breakpoints[bp].min;
				currentMax = breakpoints[bp].max;
			} else if (currentMin !== null && currentMax !== null) {
				ranges.push(
					`(min-width: ${currentMin}px)${currentMax !== Infinity ? ` and (max-width: ${currentMax}px)` : ''}`
				);
				currentMin = currentMax = null;
			}
		}

		if (currentMin !== null && currentMax !== null) {
			ranges.push(
				`(min-width: ${currentMin}px)${currentMax !== Infinity ? ` and (max-width: ${currentMax}px)` : ''}`
			);
		}

		return ranges.join(', ');
	}

	/**
	 * Parses media query, inverse of generateMediaQuery
	 */
	function parseMediaQuery(query: string) {
		const result = { mobile: false, tablet: false, desktop: false, wide: false };
		if (!query.trim()) return result;

		const parts = query.split(',');

		for (const part of parts) {
			const minWidth = parseInt(part.match(/min-width:\s*(\d+)px/)?.[1] || '0');
			const maxWidth = part.includes('max-width')
				? parseInt(part.match(/max-width:\s*(\d+)px/)?.[1] || 'Infinity')
				: Infinity;

			if (minWidth <= breakpoints.mobile.max) result.mobile = true;
			if (minWidth <= breakpoints.tablet.max && maxWidth > breakpoints.tablet.min)
				result.tablet = true;
			if (minWidth <= breakpoints.desktop.max && maxWidth > breakpoints.desktop.min)
				result.desktop = true;
			if (maxWidth === Infinity || maxWidth > breakpoints.wide.min) result.wide = true;
		}

		return result;
	}
</script>

<div class="container">
	<label>
		<input type="checkbox" bind:checked={mobile} on:change={handleClick} />
		{$lang('breakpoints_mobile')}
	</label>

	<label>
		<input type="checkbox" bind:checked={tablet} on:change={handleClick} />
		{$lang('breakpoints_tablet')}
	</label>

	<label>
		<input type="checkbox" bind:checked={desktop} on:change={handleClick} />
		{$lang('breakpoints_desktop')}
	</label>

	<label>
		<input type="checkbox" bind:checked={wide} on:change={handleClick} />
		{$lang('breakpoints_wide')}
	</label>
</div>

<input data-modal type="text" bind:value={input} on:input={handleInput} />

<style>
	.container {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.9rem;
	}

	input[type='text'] {
		width: 100%;
	}

	input[type='checkbox'] {
		color-scheme: dark;
	}
</style>
