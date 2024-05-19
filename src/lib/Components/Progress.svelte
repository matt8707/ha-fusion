<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { tweened } from 'svelte/motion';

	export let duration: number;
	export let size: number;
	export let stroke: number;

	const progress = tweened(0);

	const attributes = {
		cx: size / 2,
		cy: size / 2,
		r: (size - stroke * 2) / 2,
		fill: 'none',
		'stroke-width': stroke,
		'vector-effect': 'non-scaling-stroke'
	};

	const circumference = 2 * Math.PI * attributes.r;

	onMount(() => {
		progress.set(100, { duration });
	});

	onDestroy(() => {
		progress.set(0, { duration: 0 });
	});
</script>

<svg width={size} height={size} style:transform="rotate(-90deg)">
	<circle stroke="rgba(0, 0, 0, 0.35)" {...attributes} />
	<circle
		stroke="rgb(255, 255, 255, 1)"
		stroke-dashoffset={circumference * (1 - $progress / 100)}
		stroke-dasharray={circumference}
		{...attributes}
	/>
</svg>
