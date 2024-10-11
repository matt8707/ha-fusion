<script lang="ts">
	import {
		calendarFirstDay,
		calendarView,
		connection,
		lang,
		selectedLanguage,
		states
	} from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { base } from '$app/paths';
	import { onDestroy } from 'svelte';
	import { getName } from '$lib/Utils';
	import Calendar from '@event-calendar/core';
	import DayGrid from '@event-calendar/day-grid';
	import List from '@event-calendar/list';
	import { openModal } from 'svelte-modals';
	import Date from '$lib/Sidebar/Date.svelte';

	export let isOpen: boolean;
	export let sel: any;

	interface Event {
		id?: string;
		resourceIds?: any[];
		allDay?: boolean;
		start?: Date;
		end?: Date;
		title?: string;
		editable?: boolean | undefined;
		startEditable?: boolean | undefined;
		durationEditable?: boolean | undefined;
		display?: string;
		backgroundColor?: string;
		textColor?: string;
		extendedProps?: object;
		[key: string]: any;
	}

	let ec: any;
	let busy: boolean;
	let timeout: ReturnType<typeof setTimeout>;

	$: entity = $states[sel?.entity_id];
	$: entity_id = entity?.entity_id;

	// ec
	const plugins = [DayGrid, List];
	const options = {
		// view type
		view: $calendarView || 'dayGridMonth',

		// firstDay
		firstDay: $calendarFirstDay || 1,

		// events
		eventSources: [{ events: fetchEvents }],

		// header
		headerToolbar: {
			start: 'today prev,next, update',
			center: 'title',
			end: 'listDay,listWeek,listMonth,listYear, dayGridMonth'
		},

		// custom update button
		customButtons: {
			update: {
				text: $lang('update'),
				click: handleClick
			}
		},

		// locale
		locale: $selectedLanguage,
		noEventsContent: '',
		buttonText: {
			today: $lang('today'),
			listDay: $lang('day'),
			listWeek: $lang('week'),
			listMonth: $lang('month'),
			listYear: $lang('year'),
			dayGridMonth: $lang('overview')
		},

		// store selected view
		datesSet: (info: { view: { activeStart: Date; activeEnd: Date; type: string } }) => {
			const localStorageViewType = localStorage.getItem('calendar');
			const ecViewType = info?.view?.type;
			if (ec && ecViewType !== localStorageViewType) {
				$calendarView = ecViewType;
				localStorage.setItem('calendar', ecViewType);
			}
		},

		// onclick
		eventClick: (info: any) => {
			openModal(() => import('$lib/Modal/CalendarEventModal.svelte'), { sel, info: info?.event });
		},

		// style
		height: '100%'
	};

	// fetch data
	async function fetchEvents(fetchInfo: { start: Date; end: Date }) {
		const start = fetchInfo?.start;
		const end = fetchInfo?.end;
		const params = encodeURI(`?start=${start.toISOString()}&end=${end.toISOString()}`);
		const url = `${base}/api/calendars/${entity_id}${params}`;
		const token = $connection?.options?.auth?.data?.access_token;

		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					'content-type': 'application/json'
				}
			});

			const data = await response.json();

			const events = data.map((event: Event) => ({
				id: event?.uid,
				start: event?.start?.date || event?.start?.dateTime,
				end: event?.end?.date || event?.end?.dateTime,
				title: event?.summary,
				extendedProps: {
					description: event?.description,
					location: event?.location,
					recurrence_id: event?.recurrence_id,
					rrule: event?.rrule
				}
			}));

			return events;
		} catch (error) {
			console.error('Error fetching calendar data:', error);
			return [];
		}
	}

	// custom update button
	async function handleClick(event: any) {
		if (busy) return;
		busy = true;

		const target = event?.target;

		const setStyle = (data: boolean) => {
			target.style.opacity = data ? '0.3' : 'unset';
			target.style.cursor = data ? 'default' : 'pointer';
		};

		setStyle(true);

		try {
			await $connection.sendMessagePromise({
				type: 'call_service',
				domain: 'homeassistant',
				service: 'update_entity',
				target: { entity_id }
			});
		} catch (err) {
			console.error(err);
		} finally {
			ec?.refetchEvents();

			timeout = setTimeout(() => {
				setStyle(false);
				busy = false;
			}, 500);
		}
	}

	// cleanup
	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{getName(sel, entity)}</h1>

		<!-- ec -->
		<div data-exclude-drag-modal>
			<Calendar bind:this={ec} {plugins} {options} />
		</div>
	</Modal>
{/if}

<style>
	div {
		height: 75vh;
		margin-top: 1rem;
	}

	/* header */

	:global(.ec-title) {
		color: rgba(255, 255, 255, 0.8) !important;
		font-size: 1.45rem !important;
		margin: 0 0 0.7rem 0 !important;
	}

	:global(.ec-toolbar > div:nth-child(2)) {
		display: grid !important;
	}

	:global(.ec-title) {
		white-space: nowrap !important;
		overflow: hidden !important;
		text-overflow: ellipsis !important;
	}

	:global(.ec-button) {
		background-color: rgba(0, 0, 0, 0.2) !important;
		border-color: rgba(255, 255, 255, 0.2) !important;
		font-size: 0.9rem !important;
		font-family: inherit !important;
		padding: 0.6rem 0.95rem 0.6rem 0.95rem !important;
		border-radius: 0.6rem !important;
		box-sizing: unset !important;
		transition: opacity 100ms ease !important;
		text-transform: capitalize !important;
	}

	:global(.ec-button:disabled) {
		color: rgba(255, 255, 255, 0.5) !important;
		opacity: 0.5 !important;
	}

	:global(.ec-active) {
		background-color: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.ec-button-group .ec-button:not(:last-child)) {
		border-top-right-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}

	:global(.ec-button-group .ec-button:not(:first-child)) {
		border-top-left-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
		margin-left: -1px !important;
	}

	:global(.ec-header) {
		border-radius: 0.7rem 0.7rem 0 0 !important;
		overflow: hidden !important;
	}

	/* calendar */

	:global(.ec) {
		--ec-border-color: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.ec-body) {
		border-radius: 0 0 0.7rem 0.7rem !important;
		background-color: rgba(0, 0, 0, 0.2) !important;
		height: 100% !important;
	}

	:global(.ec-list .ec-body) {
		border-radius: 0.7rem !important;
	}

	/* day  */

	:global([role='columnheader']) {
		text-align: right !important;
		padding: 0 10px 0 0 !important;
		background-color: rgba(0, 0, 0, 0.35) !important;
		font-weight: 500 !important;
		height: 2.5rem !important;
		align-content: center !important;
	}

	:global(.ec-day-head) {
		color: rgba(255, 255, 255, 0.8) !important;
	}

	:global(.ec-list .ec-day-head) {
		background-color: rgba(0, 0, 0, 0.2) !important;
	}

	:global(div.ec-day.ec-sun.ec-today > article) {
		background-color: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.ec-day.ec-other-month .ec-day-head) {
		color: rgba(255, 255, 255, 0.2) !important;
		opacity: 1 !important;
	}

	:global([role='listitem']) {
		background-color: transparent !important;
	}

	:global(.ec-day-grid .ec-day.ec-today) {
		background-color: rgba(255, 255, 255, 0.075) !important;
	}

	:global(.ec-list .ec-day.ec-today .ec-event) {
		background-color: rgba(255, 255, 255, 0.075) !important;
	}

	:global(.ec-day-grid .ec-day-head) {
		padding: 10px 10px 5px 10px !important;
	}

	:global(.ec-day-side) {
		font-weight: 500 !important;
		color: rgb(255, 255, 255) !important;
	}

	:global(.ec-list .ec-day-head) {
		height: 2.5rem !important;
		align-content: center !important;
		padding: 0 15px 0 15px !important;
	}

	/* event */

	:global(.ec-day-grid .ec-event) {
		padding: 2px 6px !important;
		border-radius: 4px !important;
		cursor: pointer !important;
	}

	:global(.ec-list .ec-event) {
		padding: 15px !important;
		box-shadow: 0 0 1px 0 rgba(255, 255, 255, 0.35) !important;
		cursor: pointer !important;
	}

	:global(.ec-events) {
		margin: 0 9px !important;
	}

	:global(.ec-day-grid .ec-event-title, .ec-day-grid .ec-event-time) {
		font-size: 0.8rem !important;
	}

	:global(.ec-list .ec-event-title, .ec-list .ec-event-time) {
		font-size: 0.8rem !important;
	}

	:global(.ec-event-tag) {
		width: 6px !important;
		height: 6px !important;
		background-color: var(--ec-event-bg-color) !important;
		border-radius: 50% !important;
		align-self: center !important;
		margin-right: 13px !important;
	}
</style>
