<script lang="ts">
	import { states, selectedLanguage, motion, barErrors } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { getName } from '$lib/Utils';

	export let entity_id: string | undefined;
	export let math: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let id: number | undefined = undefined;

	let entity: HassEntity;
	let cache: { [id: number]: { [key: string]: number } } = {};
	let expression = 0;
	let mounted: boolean;

	const options = {
		style: 'percent',
		maximumFractionDigits: 2
	};

	$: if (entity_id) entity = $states?.[entity_id];
	$: state = entity?.state;
	$: if (math && id) {
		cache[id] = {};
	}

	$: if (entity) {
		/**
		 * Compute `expression`, first check if cached
		 * value otherwise evaluate the math expression
		 */
		let key = `${state}_${math}`;
		if (id && cache?.[id]?.[key]) {
			expression = cache[id][key];
		} else {
			expression = evaluate(state, math) || 0;
		}
	}

	onMount(() => {
		// wait a second before adding transition
		setTimeout(() => (mounted = true), 1000);
	});

	/**
	 * Evaluates the math expression based on the provided state value
	 *
	 * @example
	 * applyMathExpression(5, "x*2");  // returns 10
	 */
	function evaluate(state: string, math: string | undefined) {
		if (!math || !id || math.trim() === 'x') return Number(state);

		// trim white space and use dots
		const format = math.trim().replace(',', '.');

		try {
			// evaluate math expression
			const func = new Function('x', `return ${format}`);
			const result = func(Number(state));
			if (typeof result === 'number') {
				cache[id] = cache[id] || {};
				cache[id][`${state}_${math}`] = result;

				// clear error
				if (id) delete $barErrors[id];
				return result;
			}
		} catch (error) {
			// store error
			const err = error instanceof Error;
			if (id) {
				$barErrors[id] = err ? error.message : 'An unexpected error occurred.';
			}
		}
	}
</script>

<div class="container">
	<div class="header">
		<div class="friendly-name overflow">{getName({ name }, entity)}</div>
		<div class="state">
			{Intl.NumberFormat($selectedLanguage, options).format(expression / 100)}
		</div>
	</div>

	<div class="bar">
		<div
			class="fill"
			style:transition={mounted ? `width ${$motion}ms ease` : 'none'}
			style:width="{expression}%"
		></div>
	</div>
</div>

<style>
	.container {
		padding: var(--theme-sidebar-item-padding);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.3em;
	}

	.friendly-name {
		overflow: hidden;
		flex-grow: 1;
		text-align: justify;
	}

	.state {
		white-space: nowrap;
		margin-left: 0.5em;
	}

	.fill {
		min-height: 0.5em;
		background-color: rgb(255, 255, 255, 0.9);
	}

	.bar {
		position: relative;
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 0.225rem;
		overflow: hidden;
		width: 100%;
	}

	.overflow {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>
