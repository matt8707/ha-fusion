<script lang="ts">
	import { base } from '$app/paths';
	import { connection, selectedLanguage } from '$lib/Stores';

	let promise: Promise<any[]>;

	const baseUrl = 'http://192.168.1.241:8123';

	const sevenDays = 7 * 8.64e7;
	let start = new Date().toISOString();
	let end = new Date(Date.now() + sevenDays).toISOString();
	let entity_id = 'calendar.personligt';

	$: token = $connection?.options?.auth?.data?.access_token;

	$: if (!promise && token) {
		const url = `${baseUrl}/api/calendars/${entity_id}?start=${start}&end=${end}`;
		promise = getEvents(url, token);
	}

	async function getEvents(url: string, token: string) {
		try {
			const response = await fetch(`${base}/api/get_calendar`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url, token })
			});

			const data = await response.json();

			if (response.ok) {
				return data.sort(
					(a: any, b: any) =>
						new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
				);
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	function getTime(dateTime: string) {
		const date = new Date(dateTime);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	function getDay(dateTime: string) {
		const date = new Date(dateTime);
		return date.toLocaleDateString($selectedLanguage, { weekday: 'long' });
	}

	function getDate(dateTime: string) {
		const date = new Date(dateTime);
		return date.toLocaleDateString($selectedLanguage, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	interface Event {
		start: { dateTime: string };
		end: { dateTime: string };
		summary: string;
	}

	function groupDate(events: Event[]): { date: string; event: Event[] }[] {
		const grouped: { [key: string]: Event[] } = {};

		events.forEach((event) => {
			const date = getDate(event.start.dateTime);
			if (!grouped[date]) {
				grouped[date] = [];
			}
			grouped[date].push(event);
		});

		return Object.entries(grouped).map(([date, event]) => ({ date, event }));
	}
</script>

<div class="form">
	<div>entity_id: <input type="text" bind:value={entity_id} /></div>
	<div>start: <input type="text" bind:value={start} /></div>
	<div>end: <input type="text" bind:value={end} /></div>
	<div>
		<button
			on:click={() => {
				const url = `${baseUrl}/api/calendars/${entity_id}?start=${start}&end=${end}`;
				if (token) promise = getEvents(url, token);
			}}>submit</button
		>
	</div>
</div>

<div class="timeline">
	{#await promise}
		Loading...
	{:then events}
		{#if events}
			{#each groupDate(events) as { date, event }}
				<div class="date-group">
					<div class="date-header">
						{getDay(event[0].start.dateTime)} - {date}
					</div>

					{#each event as eventItem}
						<div class="event">
							<div>
								{getTime(eventItem.start.dateTime)}
								-
								{getTime(eventItem.end.dateTime)}
								{eventItem.summary}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	{:catch error}
		{error?.message}
	{/await}
</div>

<style>
	.date-group {
		margin-bottom: 1rem;
	}

	.date-header {
		font-size: 1.2em;
		margin-bottom: 0.5rem;
	}

	.timeline {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: 2rem;
	}

	.event {
		padding: 10px;
		border: 1px solid #ccc;
		margin: 5px 0;
		display: flex;
		flex-direction: column;
	}

	input {
		width: 12rem;
	}

	.form {
		display: flex;
		gap: 1rem;
	}
</style>
