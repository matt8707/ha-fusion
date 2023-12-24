<script lang="ts">
	/**
	 * Rewrite
	 */

	import { states, connection, config } from '$lib/Stores';
	import { marked } from 'marked';

	export let latest: string;
	export let latest_beta: string;

	let context: any;
	let response: string | undefined;
	let timer: ReturnType<typeof setTimeout>;

	$: installed = $config?.version;
	$: release_state = $states?.[latest]?.state;
	$: release_notes = $states?.[latest]?.attributes?.body as string;
	$: release_beta_state = $states?.[latest_beta]?.state;
	$: release_beta_notes = $states?.[latest_beta]?.attributes?.body as string;

	const call_service = (event: MouseEvent, data: any) => {
		// button effect
		const target = event.target as HTMLElement;
		target.style.backgroundColor = 'green';
		setTimeout(() => {
			target.style.backgroundColor = '#5e5e5e';
		}, 700);

		// const
		const unsubscribe = {
			id: 19,
			type: 'unsubscribe_events',
			subscription: 7
		};

		// events
		connection.subscribe((conn: any) => {
			conn.subscribeEvents((ev: any) => {
				// match service call with response
				if (
					ev?.context?.id === context?.context_id &&
					ev?.data?.entity_id === data.service_data.entity_id
				) {
					response = 'RESPONSE: success!';
					setTimeout(() => {
						response = undefined;
					}, 1000);
					clearTimeout(timer);
					conn?.sendMessage(unsubscribe);
				}
			}, 'state_changed');

			// or unsubscribe after 3 seconds
			timer = setTimeout(() => {
				response = 'RESPONSE: timeout...';
				conn?.sendMessage(unsubscribe);
			}, 20000);

			// call service
			data.id = 24;
			conn?.sendMessagePromise(data).then((res: any) => {
				context = {
					context_id: res.context.id,
					entity_id: data.service_data.entity_id
				};
			});
		});
	};
</script>

{#if installed}
	<div>
		installed_version: {installed}<br />
		latest_version: {release_state}<br />
		latest: {installed === release_state}<br />

		{#if release_notes}
			release_notes: {@html marked.parse(release_notes)}<br />
		{/if}

		<hr />
		is_beta: {installed?.includes('b')}<br />
		latest_beta_version: {release_beta_state}<br />
		is_latest_beta_installed: {installed === release_beta_state}<br />

		{#if release_beta_notes}
			release_beta_notes: {@html marked.parse(release_beta_notes)}<br />
		{/if}

		<p>button with response</p>

		<button
			on:click={(event) =>
				call_service(event, {
					type: 'call_service',
					domain: 'switch',
					service: 'turn_on',
					service_data: {
						entity_id: 'switch.docker_watchtower'
					}
				})}>turn on watchtower</button
		>

		{#if response}
			{JSON.stringify(response)}
		{/if}
	</div>
{/if}

<style>
	div {
		background-color: #161616;
		padding: 2em;
		border-radius: 0.8em;
		color: #cdcdcd;
	}

	button {
		padding: 2em;
		border-radius: 0.5em;
		border: none;
		background-color: #5e5e5e;
	}
</style>
