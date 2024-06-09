<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { base } from '$app/paths';

	export let data: any;

	let languages: {
		id: string;
		label: string;
	}[];

	/**
	 * Gets languages and opens modal
	 */
	async function handleClick() {
		const getIntlName = (code: string, displayLanguage = code) => {
			const name = new Intl.DisplayNames([displayLanguage], { type: 'language' }).of(code);
			return (name || code).charAt(0).toUpperCase() + (name || code).slice(1);
		};
		try {
			const response = await fetch(`${base}/_api/list_languages`);
			const data = await response.json();
			if (response.ok) {
				languages = data.map((code: string) => ({
					id: code,
					label: getIntlName(code)
				}));
			} else {
				throw new Error(`${response.status}, ${data.message}`);
			}
		} catch (error) {
			console.error(error);
		}
		openModal(() => import('$lib/Settings/Index.svelte'), { data, languages });
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Settings/Index.svelte');
	}
</script>

<button
	class="button"
	on:click={handleClick}
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	use:Ripple={$ripple}
>
	<figure>
		<Icon icon="clarity:settings-solid" height="none" />
	</figure>

	<span>{$lang('settings')}</span>
</button>
