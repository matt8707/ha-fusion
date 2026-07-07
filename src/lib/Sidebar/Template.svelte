<script lang="ts">
	import { connection, config, editMode, templates, lang } from '$lib/Stores';
	import { marked } from 'marked';
	import { onDestroy } from 'svelte';
	import type { TemplateItem } from '$lib/Types';
	import Icon from '@iconify/svelte';

	export let sel: TemplateItem | undefined = undefined;
	export let demo = false;


	let unsubscribe: () => void;
	let id = sel?.id;
	let error = false;

	$: template = sel?.template;
	$: icon = sel?.icon;

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
				$templates[id] = marked.parse(response.result) as any;
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
	 * Handles events if template contains href links.
	 * - Clicking link in edit mode opens modal instead.
	 */
	function handleEvent(event: Event) {
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
		}
	}

	/**
	 * Websocket unsubscribe 'render_template'
	 */
	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<div
        id="markdown"
        on:click={handleEvent}
        on:pointerenter={handleEvent}
        on:keydown
        role="button"
        tabindex="0"
        class="template-container"
>
        {#if icon}
			<div class="icon-wrapper">
				<Icon 
					{icon} 
					width={sel?.icon_size || 20} 
					color={sel?.icon_color}
				/>
			</div>
        {/if}
        
        <div class="content-wrapper">
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
</div>

<style>
        #markdown {
                position: relative;
                word-wrap: break-word;
                padding: var(--theme-sidebar-item-padding);
                text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
        }

        .template-container {
                display: flex;
                align-items: center;
                gap: 8px;
        }

        .icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
        }

        .content-wrapper {
                flex: 1;
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