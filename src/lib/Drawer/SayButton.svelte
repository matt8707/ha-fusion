<script lang="ts">
	/**
	 * BETA: Rewrite component!
	 */

	import { connection, lang, motion, selectedLanguage, ripple } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';

	let recognizing: boolean;
	let speech: any;

	let interim = '';
	let final = '';
	let response: string | undefined;

	async function processConversation(input: string) {
		connection.subscribe(async (conn: any) => {
			try {
				if (conn?.sendMessagePromise) {
					const res: any = await conn.sendMessagePromise({
						type: 'conversation/process',
						text: input,
						language: $selectedLanguage
					});

					response = res?.response?.speech?.plain?.speech;

					setTimeout(() => {
						final = '';
						interim = '';
						response = undefined;
					}, 2000);
				}
			} catch (error) {
				console.error('Error:', error);
			}
		});
	}

	onMount(() => {
		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (SpeechRecognition) {
			speech = new SpeechRecognition();
			speech.continuous = true;
			speech.interimResults = true;
			speech.lang = $selectedLanguage;

			speech.onstart = () => {
				recognizing = true;
			};

			speech.onresult = (event: any) => {
				interim = '';
				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						final += event.results[i][0].transcript;
					} else {
						interim += event.results[i][0].transcript;
					}
				}
			};

			speech.onend = () => {
				recognizing = false;
			};

			speech.onerror = (event: any) => {
				console.error('Error in speech recognition:', event.error);
			};
		} else {
			console.error('Speech recognition not supported in this browser.');
		}
	});

	function startRecognition() {
		// isPressed = true;
		final = '';
		interim = '';
		response = undefined;

		if (!recognizing) {
			speech.start();
		}
	}

	async function stopRecognition() {
		// isPressed = false;
		if (recognizing) {
			setTimeout(async () => {
				speech.stop();
				let iterations = 0;
				while (final === '' && iterations < 10) {
					await new Promise((resolve) => setTimeout(resolve, 100));
					iterations++;
				}
				if (final !== '') {
					processConversation(final as string);
				}
			}, 1000);
		}
	}
</script>

<button
	class="button"
	on:pointerdown={startRecognition}
	on:pointerup={stopRecognition}
	on:pointerleave={stopRecognition}
	use:Ripple={$ripple}
>
	<figure>
		<Icon icon="solar:user-speak-rounded-bold" height="none" />
	</figure>

	{$lang('say')}
</button>

<div class="response">
	{#if recognizing && !(final || interim)}
		<span in:fade={{ delay: $motion / 2, duration: $motion / 2 }}>...</span>
	{:else if recognizing && (final || interim)}
		<span>{final}</span>
		<span>{interim}</span>
	{:else if response}
		<span transition:fade={{ delay: $motion / 2, duration: $motion / 2 }}>{response}</span>
	{/if}
</div>

<style>
	.response {
		padding-left: 0.4rem;
		align-self: center;
	}
</style>
