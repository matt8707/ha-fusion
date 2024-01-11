<script lang="ts">
	import { connection, config, editMode, templates, lang } from '$lib/Stores';
	import { marked } from 'marked';
	import { onDestroy } from 'svelte';
	import type { TemplateItem } from '$lib/Types';
	import { openModal } from 'svelte-modals';

	export let sel: TemplateItem | undefined = undefined;
	export let demo = false;

	let unsubscribe: () => void;
	let id = sel?.id;
	let popup = sel?.popup;
	let error = false;

	$: template = sel?.template;

	$: if ($config?.state === 'RUNNING' && template) {
		renderTemplate(template);
	}

	/**
	 * Renders template by id to `$templates`
	 */
	async function renderTemplate(data: string) {
		if (!$connection) return;

		const handleResponse = (response: { result?: string }) => {
			if (response?.result && id) {
				$templates[id] = marked.parse(response.result) as string;
				error = false;
			}
		};

		const handleError = (err: any) => {
			if (err?.code === 'template_error' && id) {
				console.warn('render_template', err);
				$templates[id] = err.message;
				error = true;
			}
		};

		try {
			unsubscribe = await $connection.subscribeMessage(handleResponse, {
				type: 'render_template',
				template: data
			});
		} catch (error) {
			handleError(error);
		}
	}

	/**
	 * Delegate to handleEvent
	 */
	function handlePointer() {
		handleEvent({ type: 'preload' });
	}

	/**
	 * Handles events if template contains href links.
	 * - Clicking link in edit mode opens modal instead.
	 */
	async function handleEvent(event: any) {
		if (event?.type === 'click' && $editMode) {
			event.preventDefault();
		} else if (event?.type === 'pointerenter') {
			// When hovering a link display the correct cursor.
			const links = (event.target as HTMLElement).querySelectorAll('a');
			links.forEach((anchor: HTMLAnchorElement) => {
				anchor.style.cursor = !$editMode ? 'pointer' : 'unset';
			});
			// Disable any 'li' pointer events to be able to drag (?).
		} else if ((event?.type === 'pointerdown' && $editMode) || event?.type === 'pointerup') {
			const lists = (event.target as HTMLElement).querySelectorAll('li');
			lists?.forEach((list) => {
				list.style.pointerEvents = event?.type === 'pointerdown' && $editMode ? 'none' : 'unset';
			});
		} else if (event?.type === 'click' && popup !== undefined) {
			// If we have a custom popup defined, display the correct cursor and handle click
			await handleClickEvent();
		} else {
			await handlePointerEvent();
		}

	}

	/**
	 * Handle click events
	 * Opens modal for custom popup
	 */
	async function handleClickEvent() {
			openModal(() => import('$lib/Modal/CustomPopupModal.svelte'), {popup});
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointerEvent() {
		let module;

		module = await import('$lib/Modal/CustomPopupModal.svelte');

		if (module) module.default;
	}

	/**
	 * Websocket unsubscribe 'render_template'
	 */
	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="markdown"
	on:click={handleEvent}
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	style:cursor={popup !== undefined? 'pointer' : 'unset'}
	>
	{#if demo}
		<div class="template">
			<span>&#123;&#123;</span> template <span>&#125;&#125;</span>
		</div>
	{:else if id && $templates?.[id]}
		<span class:error>{@html $templates?.[id]}</span>
	{:else if template}
		{$lang('unknown')}
	{:else}
		{$lang('template')}
	{/if}
</div>

<style>
	#markdown {
		position: relative;
		word-wrap: break-word;
		padding: var(--theme-sidebar-item-padding);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	.error {
		color: red;
	}

	.template {
		color: #e06c75;
		font-family: monospace;
		font-size: 1.15rem;
		text-align: center;
	}

	.template > span {
		color: #e5c07b;
	}
</style>
