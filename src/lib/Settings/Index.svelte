<script lang="ts">
	import { base } from '$app/paths';
	import { configuration, editMode, lang, motion, ripple, selectedLanguage } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import { modals, closeModal } from 'svelte-modals';
	import Modal from '$lib/Modal/Index.svelte';
	import Language from '$lib/Settings/Language.svelte';
	import Addons from '$lib/Settings/Addons.svelte';
	import Motion from '$lib/Settings/Motion.svelte';
	import Version from '$lib/Settings/Version.svelte';
	import Token from '$lib/Settings/Token.svelte';
	import CustomJs from '$lib/Settings/CustomJs.svelte';
	import Logout from '$lib/Settings/Logout.svelte';
	import Ripple from 'svelte-ripple';

	export let data: any;
	export let isOpen: boolean;

	export let languages: {
		id: string;
		label: string;
	}[];

	let formElement: HTMLFormElement;
	let timeout: ReturnType<typeof setTimeout> | null;
	let responseCode: number | undefined;

	/**
	 * Saves form data to /data/configuration.yaml
	 */
	async function handleSubmit() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		try {
			const formDataToObject = (formData: FormData) => {
				const object: Record<string, string | File> = {};
				formData.forEach((value, key) => (object[key] = value));
				return object;
			};

			const data = new FormData(formElement);
			const form = formDataToObject(data);

			const addons = {
				...(form.youtube && { youtube: form.youtube === 'true' }),
				...(form.maptiler && { maptiler: { apikey: form.maptiler } })
			};

			if (typeof form.maptiler === 'string') {
				$configuration.addons = $configuration.addons || {};
				$configuration.addons.maptiler = { apikey: form.maptiler };
			}

			const token = form.token || undefined;
			const custom_js = form.custom_js ? Boolean(form.custom_js === 'true') : undefined;
			const formMotion = form.motion ? Boolean(form.motion === 'true') : undefined;

			const json: any = {
				locale: $selectedLanguage
			};

			if (token) {
				json.token = token;
				$configuration.token = token as string;
			}

			if (Object.keys(addons).length > 0) json.addons = addons;
			if (custom_js) json.custom_js = custom_js;

			if (!formMotion) {
				$motion = 0;
				json.motion = false;
			} else {
				$motion = 190;
			}

			const response = await fetch(`${base}/_api/save_config`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(json)
			});

			responseCode = response.status;

			if (response.ok) {
				timeout = setTimeout(() => {
					responseCode = undefined;
				}, 2500);
			}
		} catch (error) {
			console.error(error);
			responseCode = 500;
		}
	}

	/**
	 * Save keyboard shortcut when pressing cmd/ctrl + s
	 */
	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			if ($modals.length > 0 && !$editMode) {
				// don't open browser save dialog
				event.preventDefault();
				handleSubmit();
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('settings')}</h1>

		<form id="settings" name="settings" bind:this={formElement} on:submit|preventDefault>
			<Language {languages} />

			<Token />

			<Addons {data} />

			<Version />

			<CustomJs />

			<Motion />

			<Logout />

			<div class="buttons">
				<div class="save-container">
					<button
						class="action save"
						on:click|preventDefault={handleSubmit}
						use:Ripple={{
							...$ripple,
							color: 'rgba(0, 0, 0, 0.35)'
						}}
					>
						{$lang('save')}
					</button>

					{#if responseCode === 200}
						<span class="res success" transition:fade={{ duration: $motion }}>
							{$lang('successfully_saved')}
						</span>
					{:else if responseCode}
						<span class="res error" transition:fade={{ duration: $motion }}>
							{$lang('error_save_yaml')?.replace('{error}', `[${String(responseCode)}]`)}
						</span>
					{/if}
				</div>

				<button class="action done" on:click|preventDefault={closeModal} use:Ripple={$ripple}>
					{$lang('done')}
				</button>
			</div>
		</form>
	</Modal>
{/if}

<style>
	.buttons {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: 0.9rem;
		padding-top: 1.5rem;
		display: flex;
		justify-content: space-between;
	}

	.save {
		background-color: #ffc107;
		color: #3b0f10 !important;
		font-weight: 500;
	}

	.res {
		margin-left: 0.9rem;
		align-self: center;
	}

	.success {
		color: #00dd17;
	}

	.error {
		color: #f92626;
	}

	.save-container {
		display: flex;
		align-items: center;
	}
</style>
