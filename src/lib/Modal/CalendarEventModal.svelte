<script lang="ts">
	import Modal from '$lib/Modal/Index.svelte';
	import { states, selectedLanguage, ripple, motion, lang, connection } from '$lib/Stores';
	import { getSupport, getName } from '$lib/Utils';
	import Icon from '@iconify/svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Ripple from 'svelte-ripple';
	import { closeModal } from 'svelte-modals';

	export let isOpen: boolean;
	export let sel: any;
	export let info: any;

	const debug = false;

	let busy = false;

	$: entity = $states?.[sel?.entity_id];
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		CREATE_EVENT: 1,
		DELETE_EVENT: 2,
		UPDATE_EVENT: 4
	});

	function format(type?: string) {
		const options: Record<string, string> = {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};

		return new Intl.DateTimeFormat(
			$selectedLanguage,
			type === 'allDay'
				? options
				: {
						...options,
						hour: 'numeric',
						minute: '2-digit'
					}
		);
	}

	async function deleteEvent() {
		if (busy) return;
		busy = true;
		try {
			await $connection?.sendMessagePromise({
				type: 'calendar/event/delete',
				entity_id: entity?.entity_id,
				uid: info?.id,
				recurrence_id: info?.extendedProps?.recurrence_id || '',
				recurrence_range: ''
			});
		} catch (error) {
			console.error(error);
		} finally {
			busy = false;
			closeModal();
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{info?.title || getName(sel, entity)}</h1>

		<div class="container">
			<!-- date -->
			{#if info?.allDay && info?.start}
				<div class="date">
					{format('allDay').format(info?.start)}
				</div>
			{:else if info?.start && info?.end}
				<div class="date">
					{format().formatRange(info?.start, info?.end)}
				</div>
			{/if}

			<!-- location -->
			{#if info?.extendedProps?.location}
				<div class="section">
					<div class="icon">
						<Icon icon="mdi:map-marker-outline" height="none" width="1.25rem" />
					</div>

					{info?.extendedProps?.location}
				</div>
			{/if}

			<!-- description -->
			{#if info?.extendedProps?.description}
				<div class="section">
					<div class="icon">
						<Icon icon="mdi:text" height="none" width="1.25rem" />
					</div>

					{info?.extendedProps?.description}
				</div>
			{/if}

			{#if entity}
				<div class="section">
					<div class="icon">
						<Icon icon="mdi:calendar" height="none" width="1.25rem" />
					</div>

					{getName(sel, entity)}
				</div>
			{/if}
		</div>

		<!-- debug -->
		{#if debug}
			<div class="debug">
				<pre>
<code>sel: {JSON.stringify(sel, null, 2)}</code>
<code>info: {JSON.stringify(info, null, 2)}</code>
<code>entity: {JSON.stringify(entity, null, 2)}</code>
<code>supports: {JSON.stringify(supports, null, 2)}</code>
				</pre>
			</div>
		{/if}

		<!-- buttons -->
		<div class="add-config-button">
			<button
				class="action"
				class:remove={supports?.DELETE_EVENT && !busy}
				class:done={!supports?.DELETE_EVENT || busy}
				use:Ripple={{
					...$ripple,
					opacity: !supports?.DELETE_EVENT || busy ? '0' : $ripple.opacity
				}}
				style:opacity={!supports?.DELETE_EVENT || busy ? '0.3' : '1'}
				disabled={!supports?.DELETE_EVENT || busy}
				style:cursor={supports?.DELETE_EVENT && !busy ? 'pointer' : 'unset'}
				style:transition="opacity {$motion}ms ease, background-color {$motion}ms ease"
				on:click={deleteEvent}
			>
				{$lang('event_delete')}
			</button>

			<ConfigButtons {sel} />
		</div>
	</Modal>
{/if}

<style>
	.container {
		display: grid;
		margin-top: 1rem;
		grid-gap: 0.6rem;
	}

	.section {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}

	.date {
		font-size: 1.1rem;
		font-weight: 500;
		margin-bottom: 0.4rem;
	}

	.icon {
		flex-shrink: 0;
		flex-grow: 0;
		align-self: flex-start;
		margin-top: 0.2rem;
		opacity: 0.5;
	}

	.add-config-button {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.add-config-button > button {
		height: fit-content;
		align-self: end;
	}

	.debug {
		margin-top: 1rem;
		background-color: rgba(0, 0, 0, 0.4);
		padding: 0.2rem 1rem;
		font-size: 0.75rem;
		border-radius: 0.65rem;
	}
</style>
