<script context="module" lang="ts">
	let animateConfetti = true;
</script>

<script lang="ts">
	import { translation, lang, motion, showDrawer, connection, selectedLanguage } from '$lib/Stores';
	import { fade, scale } from 'svelte/transition';
	import { Confetti } from 'svelte-confetti';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	export let data: any;

	const duration = 1500;

	let displayWelcome = false;
	let displayMenuButton = false;

	onMount(async () => {
		const delay = (ms: number) => {
			return new Promise((resolve) => setTimeout(resolve, ms));
		};

		displayWelcome = true;

		await delay(duration);
		displayMenuButton = true;

		await delay(500);
		animateConfetti = false;
	});

	$: if ($connection && data?.configuration?.locale === undefined) {
		getUserLanguage();
	}

	async function getUserLanguage() {
		try {
			const response: any = await $connection.sendMessagePromise({
				type: 'frontend/get_user_data',
				key: 'language'
			});

			const data = response?.value?.language;

			if (data) {
				// don't need to reload 'en'
				if (data === 'en') return;

				// load locale
				loadSelectedLang(data);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function loadSelectedLang(value: string) {
		$selectedLanguage = value;

		try {
			const response = await fetch(`${base}/_api/get_translation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ locale: value })
			});

			const data = await response.json();

			if (response.ok) {
				$translation = data;
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<main>
	{#if displayWelcome}
		<div class="intro" transition:scale={{ duration: 380 }}>
			<span class="text"> {$lang('welcome_home')} 👋</span>

			<br />

			<div style:height="3rem">
				{#if displayMenuButton}
					<button
						on:click={() => ($showDrawer = true)}
						transition:fade|global={{ duration: $motion }}
						style:opacity={$showDrawer ? '0' : '1'}
						style:pointer-events={$showDrawer ? 'none' : 'unset'}
						style:transition="opacity {!$showDrawer ? $motion * 2 : $motion}ms ease"
					>
						{$lang('open_menu')}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if animateConfetti}
		<div class="confetti">
			<Confetti x={[-2.2, 2.2]} y={[-2.2, 2.2]} {duration} amount="150" />
		</div>
	{/if}
</main>

<style>
	main {
		grid-area: main;
	}

	button {
		font-size: 1.1rem;
		border-radius: 0.8rem;
		background-color: rgb(255, 255, 255, 0.1);
		color: white;
		padding: 0.5rem 0.85rem;
		border: 2px solid white;
		cursor: pointer;
	}

	.intro {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 83vh;
	}

	.text {
		font-size: 4rem;
		font-weight: 700;
		text-align: center;
	}

	.confetti {
		position: fixed;
		top: 40%;
		left: 0;
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
</style>
