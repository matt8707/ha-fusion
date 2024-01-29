<script lang="ts">
	import { base } from '$app/paths';
	import { translation, selectedLanguage, lang } from '$lib/Stores';
	import Select from '$lib/Components/Select.svelte';

	export let languages: {
		id: string;
		label: string;
	}[];

	async function loadSelectedLang(value: string) {
		$selectedLanguage = value;

		try {
			const response = await fetch(`${base}/_api/get_translation`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locale: value })
			});

			const data = await response.json();

			document.documentElement.lang = $selectedLanguage || 'en';

			if (response.ok) {
				$translation = data;
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	}

	const href = 'https://www.home-assistant.io/docs/configuration/basic/#language';
</script>

<h2>{$lang('language')}</h2>

<p class="overflow">
	{$lang('docs')} -
	<a {href} target="blank">{href}</a>
</p>

{#if languages.length !== 0}
	<Select
		options={languages}
		placeholder={$lang('language')}
		value={$selectedLanguage}
		on:change={(event) => {
			loadSelectedLang(event?.detail || 'en');
		}}
	/>
{/if}

<style>
	a {
		color: #fa8f92;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	p:hover {
		cursor: default;
	}
</style>
