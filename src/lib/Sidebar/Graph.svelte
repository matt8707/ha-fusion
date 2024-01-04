<script lang="ts">
	import { states, connection, selectedLanguage, lang } from '$lib/Stores';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import { line, area, curveBasis } from 'd3-shape';
	import { extent, bisector } from 'd3-array';
	import { getName } from '$lib/Utils';

	export let entity_id: string | undefined;
	export let name: string | undefined = undefined;
	export let period = 'day';
	export let stroke = 2;

	let width: number;
	let height: number;
	let chartData: any[] = [];
	let resizeTimeout: ReturnType<typeof setTimeout>;
	let isResizing: boolean;
	let start_time = new Date(Date.now() - 2629800 * 1000).toISOString();
	let end_time = new Date().toISOString();
	let m = { x: 0, y: 0 };
	let point: { [x: string]: any };
	let xAccessor = (d: any) => d.x;
	let yAccessor = (d: any) => d.y;
	let interpolation = curveBasis;
	let hovering = false;
	let hover_state: string;
	let hover_date_min: string;
	let hover_date_max: string;

	$: entity = entity_id && $states?.[entity_id];

	$: xScale = scaleTime()
		.domain(extent(chartData, xAccessor) as any)
		.range([1, width - 1]);
	$: yScale = scaleLinear()
		.domain(extent(chartData, yAccessor) as any)
		.range([height - 1, 1])
		.nice();

	$: xAccessorScaled = (d: any) => xScale(xAccessor(d));
	$: yAccessorScaled = (d: any) => yScale(yAccessor(d));
	$: y0AccessorScaled = yScale(yScale.domain()[0]);

	$: lineGenerator = line().x(xAccessorScaled).y(yAccessorScaled).curve(interpolation);
	$: _line = lineGenerator(chartData);

	$: areaGenerator = area()
		.x(xAccessorScaled)
		.y0(y0AccessorScaled)
		.y1(yAccessorScaled)
		.curve(interpolation);
	$: _area = areaGenerator(chartData);

	// if width or height changes don't transition
	$: if (width || height) {
		isResizing = true;
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			isResizing = false;
		}, 200);
	}

	$: if (entity_id || period) {
		fetchData();
	}

	$: if (hovering && point?.['y'])
		hover_state = Intl.NumberFormat($selectedLanguage, { maximumFractionDigits: 1 }).format(
			point['y']
		);

	$: if (hovering && point?.['x'])
		hover_date_min = new Intl.DateTimeFormat($selectedLanguage, { weekday: 'short' }).format(
			new Date(point?.['x'])
		);

	$: if (hovering && point?.['x'])
		hover_date_max =
			' ' +
			new Intl.DateTimeFormat($selectedLanguage, { timeStyle: 'short' }).format(
				new Date(point?.['x'])
			);

	let unit_of_measurement: string;
	let friendlyName: string | undefined;
	let state: string;
	let not_hover_state: string;

	$: if (entity) {
		unit_of_measurement = entity?.attributes?.unit_of_measurement || '';

		friendlyName = getName({ name }, entity);

		state = entity?.state;

		not_hover_state = Intl.NumberFormat($selectedLanguage, {
			maximumFractionDigits: 1
		}).format(Number(entity?.state));
	}

	function fetchData() {
		if (!entity_id) return;

		connection.subscribe((conn) =>
			conn
				?.sendMessagePromise({
					type: 'recorder/statistics_during_period',
					start_time: start_time,
					end_time: end_time,
					statistic_ids: [entity_id],
					period: period || 'day'
				})
				.then((res: any) => {
					if (!entity_id) return;

					if (res[entity_id] && Array.isArray(res[entity_id])) {
						chartData = res[entity_id].map(
							(item: { start: string; mean?: number; state?: number }) => ({
								x: new Date(item.start),
								y: item.mean !== undefined ? item.mean : item.state
							})
						);
					} else {
						chartData = [];
					}
				})
		);
	}

	function handlePointerMove(event: any) {
		hovering = true;
		m.x = event.offsetX;
		m.y = event.offsetY;

		if (!xScale) return;

		const xValue = xScale.invert(m.x);
		const bisect = bisector((d: any) => d.x).right;
		const i = chartData ? bisect(chartData, xValue) : 0;
		if (i < chartData.length) {
			point = chartData[i];
		}
	}

	function handlePointerLeave() {
		hovering = false;
	}
</script>

<div class="container">
	<p>
		{#if friendlyName}
			{friendlyName}
		{:else}
			{$lang('graph')}
			<br /><br />
		{/if}
	</p>
	<p style:margin-bottom="0.25rem">
		{#if state}
			{#if hovering && point?.['y']}
				{hover_state}
				{unit_of_measurement}
				{#if point?.['x']}
					{hover_date_min}
					{hover_date_max}
				{/if}
			{:else}
				{not_hover_state}
				{unit_of_measurement}
			{/if}
		{/if}
	</p>

	<div
		class="timeline"
		bind:clientWidth={width}
		bind:clientHeight={height}
		on:pointermove={(event) => handlePointerMove(event)}
		on:pointerleave={handlePointerLeave}
	>
		<svg width="100%" height="100%">
			<defs>
				<linearGradient id="area-gradient" gradientTransform="rotate(90)">
					<stop offset="0%" stop-color="rgb(255, 255, 255, 0.5)" />
					<stop offset="100%" stop-color="rgb(255, 255, 255, 0)" />
				</linearGradient>
			</defs>
			{#if !_line?.includes('NaN')}
				<path
					d={_line}
					class="line"
					style:stroke-width={stroke}
					style={`transition: d ${isResizing ? '0ms' : '190ms'} ease`}
				/>
				<path
					d={_area}
					style={`fill: url(#area-gradient); transition: d ${isResizing ? '0ms' : '190ms'} ease`}
				/>
			{/if}
		</svg>
	</div>
</div>

<style>
	p {
		text-overflow: ellipsis;
		overflow: hidden;
		margin-block-start: 0;
		margin-block-end: 0;
	}

	.container {
		padding: var(--theme-sidebar-item-padding);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	.timeline {
		font-family: inherit;
		height: 5rem;
	}

	.line {
		fill: none;
		stroke: #ffffff;
		stroke-linecap: butt;
	}
</style>
