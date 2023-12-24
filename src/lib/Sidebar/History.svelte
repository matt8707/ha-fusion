<script lang="ts">
	import { connection, states, selectedLanguage, onStates, lang } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import { getName } from '$lib/Utils';

	export let entity_id: string;
	export let period: string | undefined = 'hour';

	let start_time: Date;
	let end_time: Date;
	let durationDate: string | undefined;
	let data: TimelineData = { totalDuration: 0, events: [] };
	let unsubscribe: () => void;

	const setTime = () => {
		if (period) start_time = new Date(new Date().getTime() - getMs(period));
		end_time = new Date();
	};

	const formatDate = (
		date: string | number | Date,
		options: Intl.DateTimeFormatOptions | undefined
	) => new Intl.DateTimeFormat($selectedLanguage, options).format(new Date(date));

	// initial set time
	$: if (period) {
		setTime();
	}

	// update start_time and end_time every minute
	setInterval(setTime, 60 * 1000);

	$: if (entity_id) {
		connection.subscribe((conn) => {
			conn
				?.subscribeMessage(
					(res) => {
						data = processTimelineData(res);
					},
					{
						type: 'history/stream',
						entity_ids: [entity_id],
						start_time: start_time,
						end_time: end_time,
						minimal_response: true,
						no_attributes: true
					}
				)
				.then((innerUnsubscribe) => {
					unsubscribe = innerUnsubscribe;
				})
				.catch((error) => {
					console.error(error);
				});
		});
	}

	$: state = $states?.[entity_id]?.state;

	type Event = {
		start: any;
		end: any;
		duration: number;
		durationPercentage: number;
		state: any;
	};

	type TimelineData = {
		totalDuration: number;
		events: Event[];
	};

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	function getMs(period: string) {
		if (period === '5minute') {
			return 300 * 1000;
		} else if (period === 'hour') {
			return 3600 * 1000;
		} else if (period === 'day') {
			return 86400 * 1000;
		} else if (period === 'week') {
			return 604800 * 1000;
		} else if (period === 'month') {
			return 2629800 * 1000;
		}
		return 3600 * 1000;
	}

	function processTimelineData(data: any) {
		let events = [];
		let totalDuration = end_time.getTime() / 1000 - data.start_time;

		for (let i = 0; i < data.states[entity_id].length; i++) {
			let start = data.states[entity_id][i].lu;
			let end;

			if (i < data.states[entity_id].length - 1) {
				end = data.states[entity_id][i + 1].lu;
			} else {
				end = end_time.getTime() / 1000;
			}

			let duration = end - start;

			events.push({
				start: start,
				end: end,
				duration: duration,
				durationPercentage: (duration / totalDuration) * 100,
				state: data.states[entity_id][i].s
			});
		}

		return { totalDuration, events };
	}

	function handlePointerEnter(event: {
		start: any;
		end: any;
		duration: number;
		durationPercentage: number;
		state: any;
	}) {
		const start = new Date(event.start * 1000).toLocaleString();
		const end = new Date(event.end * 1000).toLocaleString();

		const start_weekday = formatDate(start, { weekday: 'short' });
		const start_time = formatDate(start, { timeStyle: 'short' });

		const end_weekday = formatDate(end, { weekday: 'short' });
		const end_time = formatDate(end, { timeStyle: 'short' });

		durationDate = `
			${$lang(event.state)} ${start_weekday} ${start_time} -
			${start_weekday !== end_weekday ? end_weekday : ''} ${end_time}
		`;
	}

	function handlePointerLeave() {
		durationDate = undefined;
	}
</script>

<div class="container">
	<span class="text">
		{getName(undefined, $states?.[entity_id])} &nbsp;
		<br />

		{#if durationDate}
			{durationDate || ''} &nbsp;
		{:else if state}
			{$lang(state) || ''} &nbsp;
		{:else}
			&nbsp;
		{/if}
	</span>

	{#if data.events?.length !== 0}
		<div class="timeline">
			{#each data.events as event (event.start)}
				<div
					class="event {$onStates.includes(event.state) ? 'on' : 'off'}"
					style="width: {event.durationPercentage}%;"
					on:pointerenter={() => handlePointerEnter(event)}
					on:pointerleave={handlePointerLeave}
				>
					<span class="state"> {$lang(event.state)}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="timeline">
			<div class="event off" style="width: 100%;">&nbsp;</div>
		</div>
	{/if}
</div>

<style>
	.container {
		padding: var(--theme-sidebar-item-padding);
	}

	.text {
		display: block;
		margin-bottom: 0.25rem;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.timeline {
		display: flex;
		border-radius: 0.4rem;
		overflow: hidden;
	}

	.state {
		padding: 0.25rem 0.55rem;
		overflow: hidden;
	}

	.event {
		overflow: hidden;
		align-self: center;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
	}

	.event.on {
		background: rgba(255, 255, 255, 0.2);
	}

	.event.off {
		background-color: rgba(0, 0, 0, 0.3);
	}
</style>
