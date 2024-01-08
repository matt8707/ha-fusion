<script lang="ts">
	import { states, lang, connection, selectedLanguage } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getDomain, getName } from '$lib/Utils';
	import { callService } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: state = entity?.state;
	$: type = getType(entity?.attributes?.has_date, entity?.attributes?.has_time);
	$: domain = getDomain(entity.entity_id) as string;

	/**
	 * Handles input_datetime
	 */
	function handleChange(event: any) {
		if (!entity?.entity_id) return;

		const target = event?.target as HTMLInputElement;

		const service = domain === 'datetime' ? 'set_value' : 'set_datetime';
		const data =
			domain === 'datetime' ? { datetime: target?.value } : type && { [type]: target?.value };

		callService($connection, domain, service, {
			entity_id: entity?.entity_id,
			...data
		});
	}

	/**
	 * datetime | date | time | timestamp
	 */
	function getType(date: boolean, time: boolean) {
		if (date && time) return 'datetime';
		else if (date) return 'date';
		else if (time) return 'time';
	}

	function format(state: any, type: string) {
		try {
			if (type === 'datetime') {
				return new Intl.DateTimeFormat($selectedLanguage, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				}).format(new Date(state));
			} else if (type === 'date') {
				return new Intl.DateTimeFormat($selectedLanguage, {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}).format(new Date(state));
			} else if (type === 'time') {
				// 'HH:MM:SS'
				const timeParts = state.split(':');
				const date = new Date();
				date.setHours(timeParts[0], timeParts[1], timeParts[2] || 0);
				return new Intl.DateTimeFormat($selectedLanguage, {
					hour: 'numeric',
					minute: '2-digit',
					second: '2-digit',
					hour12: undefined
				}).format(date);
			}
		} catch (error) {
			console.error('Error formatting date/time:', error);
			return 'Invalid Date/Time';
		}
	}

	function convert(state: string) {
		const date = new Date(state);
		const year = date.getUTCFullYear();
		const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
		const day = date.getUTCDate().toString().padStart(2, '0');
		const hours = date.getUTCHours().toString().padStart(2, '0');
		const minutes = date.getUTCMinutes().toString().padStart(2, '0');
		const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
		return formattedDateTime;
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>
			{#if domain === 'datetime' || type === 'datetime'}
				{$lang('date_or_time')}
			{:else if type}
				{$lang(type)}
			{/if}

			<span class="align-right">
				{format(state, type || 'datetime')}
			</span>
		</h2>

		<input
			class="input"
			type={domain === 'datetime' || type === 'datetime' ? 'datetime-local' : type}
			value={domain === 'datetime' ? convert(state) : state}
			on:change={handleChange}
		/>

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.input[type='datetime-local'] {
		color-scheme: dark;
	}
</style>
