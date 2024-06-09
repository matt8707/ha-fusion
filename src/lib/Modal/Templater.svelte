<script lang="ts">
	import {
		dashboard,
		record,
		lang,
		autocompleteList,
		templates,
		ripple,
		pasteContent,
		motion,
		connection,
		services
	} from '$lib/Stores';
	import { onDestroy, onMount, tick } from 'svelte';
	import CodeEditor from '$lib/Components/CodeEditor.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Button from '$lib/Main/Button.svelte';
	import type { ButtonItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';
	import { closeAllModals, closeModal } from 'svelte-modals';
	import { slide } from 'svelte/transition';
	import Select from '$lib/Components/Select.svelte';
	import parser from 'js-yaml';
	import { subscribeServices } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: ButtonItem;
	export let type: 'set_state' | 'name' | 'icon' | 'color' | 'service' | 'state';

	let template = sel?.template?.[type];
	let modalTransitionEnd = false;

	let service: string | undefined;
	let servicesOptions: Array<{ id: string; label: string; icon?: string }>;

	function handleEvent() {
		modalTransitionEnd = true;
	}

	onMount(async () => {
		if (type !== 'service') return;

		/**
		 * Parse template string
		 */
		if (template) {
			try {
				const result = parser.load(template as string) as { service: string };
				service = result?.service || undefined;
			} catch {
				service = undefined;
			}
		}

		/**
		 * Get services
		 */
		if (!$services) {
			subscribeServices($connection, (hassServices) => {
				services.set(hassServices);
			});
		}

		/**
		 * Get service icons and
		 * generate dropdown data
		 */
		if (!$connection) return;

		try {
			const response = (await $connection.sendMessagePromise({
				type: 'frontend/get_icons',
				category: 'services'
			})) as { resources?: { [key: string]: string } };

			if (response?.resources) {
				const serviceCallIcons: any = response?.resources;

				if (!$services && !serviceCallIcons) return;

				servicesOptions = Object.keys($services)
					.sort()
					.reduce<Array<{ id: string; label: string; icon?: string }>>(
						(acc, key) => [
							...acc,
							...Object.keys($services[key]).map((subKey) => {
								const option: { id: string; label: string; icon?: string } = {
									id: `${key}.${subKey}`,
									label: `${key}.${subKey}`
								};
								if (serviceCallIcons[key]?.[subKey]) {
									option.icon = serviceCallIcons[key]?.[subKey];
								}
								return option;
							})
						],
						[]
					);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	});

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal on:transitionend={handleEvent}>
		<h1 slot="title">{$lang(type)}</h1>

		<h2>
			{$lang('preview')}
		</h2>

		<div style:pointer-events="none">
			<Button {sel} />
		</div>

		<h2>{$lang('docs')}</h2>

		<div style="display: flex; align-items: center; flex-wrap: wrap; font-size: 0.85rem;">
			<a target="_blank" href="https://www.home-assistant.io/docs/configuration/templating/"
				>Templating</a
			>,&nbsp;
			<a target="_blank" href="https://jinja.palletsprojects.com/en/latest/templates/">Jinja2</a
			>,&nbsp;
			<a target="_blank" href="https://commonmark.org/help/">Markdown</a>,&nbsp;
			<a target="_blank" href="https://www.w3schools.com/html/html_intro.asp">HTML</a>,&nbsp;

			<div class="shortcut">
				<span style="font-weight: 500; margin-right: 0.6em;">
					{$lang('shortcuts')}:
				</span>
				<div class="key">ctrl</div>
				<div class="key" style="border: 1px solid transparent; padding: 0 0.4em;">+</div>
				<div class="key">space</div>
			</div>
		</div>

		<h2>{$lang('shortcuts')}</h2>

		<div class="container">
			{#if type === 'set_state' || type === 'state'}
				<button
					class="template-example"
					on:click={() => {
						//paste into code editor
						$pasteContent = `{{ states(entity_id) }}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;&lbrace;</span>
					<span class="red">states(entity_id) </span>
					<span class="yellow">&rbrace;&rbrace;</span>
				</button>

				<button
					class="template-example"
					on:click={() => {
						//paste into code editor
						$pasteContent = `{{ is_state(entity_id, "on") }}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;&lbrace;</span>
					<span class="red">
						is_state(entity_id, <span class="green"> "on"</span>)
					</span>
					<span class="yellow">&rbrace;&rbrace;</span>
				</button>

				<button
					class="template-example"
					on:click={() => {
						//paste into code editor
						$pasteContent = `{{ is_state_attr(entity_id, "key", "value") }}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;&lbrace;</span>
					<span class="red">
						is_state_attr(entity_id,
						<span class="green">"key"</span>, <span class="green">"value"</span>)
					</span>
					<span class="yellow">&rbrace;&rbrace;</span>
				</button>

				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `{% if is_state(entity_id, "on") %}
  Yes
{% else %}
  No
{% endif %}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;%</span>
					<span class="purple">if</span>
					<span class="red"
						>is_state(entity_id,
						<span class="green">"on"</span>)
					</span>
					<span class="yellow">%&rbrace;</span>
					Yes
					<span class="yellow">&lbrace;%</span>
					<span class="purple">else</span>
					<span class="yellow">%&rbrace;</span>
					No
					<span class="yellow">&lbrace;%</span>
					<span class="purple">endif</span>
					<span class="yellow">%&rbrace;</span>
				</button>
			{:else if type === 'icon'}
				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `{% if is_state(entity_id, "on") %}
  humbleicons:switch-on
{% else %}
  humbleicons:switch-off
{% endif %}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;%</span>
					<span class="purple">if</span>
					<span class="red"
						>is_state(entity_id,
						<span class="green">"on"</span>)
					</span>
					<span class="yellow">%&rbrace;</span>
					humbleicons:switch-on
					<span class="yellow">&lbrace;%</span>
					<span class="purple">else</span>
					<span class="yellow">%&rbrace;</span>
					humbleicons:switch-off
					<span class="yellow">&lbrace;%</span>
					<span class="purple">endif</span>
					<span class="yellow">%&rbrace;</span>
				</button>
			{:else if type === 'name'}
				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `{{ state_attr(entity_id, "friendly_name") }}`;
					}}
					use:Ripple={$ripple}
				>
					<span style:color="rgb(224, 188, 121)">&lbrace;&lbrace;</span>
					<span style:color="rgb(221, 106, 115)">
						state_attr(entity_id,
						<span style:color="rgb(151, 194, 120)">"friendly_name"</span>)
					</span>
					<span style:color="rgb(224, 188, 121)">&rbrace;&rbrace;</span>
				</button>

				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `{% if is_state(entity_id, "on") %}
  Yes
{% else %}
  No
{% endif %}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;%</span>
					<span class="purple">if</span>
					<span class="red"
						>is_state(entity_id,
						<span class="green">"on"</span>)
					</span>
					<span class="yellow">%&rbrace;</span>
					Yes
					<span class="yellow">&lbrace;%</span>
					<span class="purple">else</span>
					<span class="yellow">%&rbrace;</span>
					No
					<span class="yellow">&lbrace;%</span>
					<span class="purple">endif</span>
					<span class="yellow">%&rbrace;</span>
				</button>
			{:else if type === 'color'}
				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `{% if is_state(entity_id, "on") %}
  green
{% else %}
  darkred
{% endif %}`;
					}}
					use:Ripple={$ripple}
				>
					<span class="yellow">&lbrace;%</span>
					<span class="purple">if</span>
					<span class="red"
						>is_state(entity_id,
						<span class="green">"on"</span>)
					</span>
					<span class="yellow">%&rbrace;</span>
					green
					<span class="yellow">&lbrace;%</span>
					<span class="purple">else</span>
					<span class="yellow">%&rbrace;</span>
					darkred
					<span class="yellow">&lbrace;%</span>
					<span class="purple">endif</span>
					<span class="yellow">%&rbrace;</span>
				</button>
			{:else if type === 'service'}
				<button
					class="template-example"
					on:click={() => {
						$pasteContent = `entity_id: {{ entity_id }}`;
					}}
					use:Ripple={$ripple}
				>
					entity_id:
					<span class="yellow">&lbrace;&lbrace;</span>
					<span class="red">entity_id</span>
					<span class="yellow">&rbrace;&rbrace;</span>
				</button>
			{/if}
		</div>

		{#if type === 'service'}
			<h2>{$lang('service')}</h2>

			{#if servicesOptions}
				<Select
					defaultIcon="mdi:room-service"
					computeIcons={true}
					options={servicesOptions}
					placeholder={$lang('service')}
					value={service}
					on:change={async (event) => {
						if (event?.detail === null) return;
						service = event?.detail;
						$pasteContent = '__clear__';
						await tick();
						$pasteContent = `service: ${event?.detail}
data: {}`;
					}}
				/>
			{/if}
		{/if}

		<h2>
			{$lang($templates?.[sel?.id]?.[type]?.error ? 'error' : 'template_editor')}
		</h2>

		{#if $templates?.[sel?.id]?.[type]?.error}
			<div class="error" transition:slide={{ duration: $motion }}>
				{$templates?.[sel?.id]?.[type]?.error}
			</div>
		{/if}

		<CodeEditor
			bind:value={template}
			type="jinja2"
			transitionend={modalTransitionEnd}
			autocompleteList={$autocompleteList}
			on:change={(event) => {
				if (!type) return;

				// if no template key, create an object
				if (!sel?.template) sel.template = {};

				if (event?.detail) {
					sel.template[type] = event.detail;

					// example, remove sel.icon in favour of sel.template.icon
					if (type !== 'set_state') {
						delete sel[type];
					}

					// no event
				} else {
					delete sel?.template?.[type];
					delete $templates?.[sel?.id]?.[type];
					$templates = $templates;
				}

				// if empty remove template key
				if (sel?.template && Object.keys(sel?.template).length === 0) {
					delete sel.template;
				}

				// trigger reactivity
				$dashboard = $dashboard;
			}}
		/>

		<div class="add-config-buttons">
			<div class="config-buttons-group">
				<!-- REMOVE -->
				<button
					class="action remove"
					on:click={() => {
						// remove template
						delete sel?.template?.[type];
						delete $templates?.[sel?.id]?.[type];
						$templates = $templates;

						// if sel.template is empty remove template key
						if (sel?.template && Object.keys(sel?.template).length === 0) {
							delete sel.template;
						}

						closeModal();
					}}
					use:Ripple={$ripple}
				>
					{$lang('remove')}
				</button>

				<!-- BACK -->
				<button
					class="action done"
					on:click={() => {
						closeModal();
					}}
					use:Ripple={$ripple}
				>
					{$lang('back')}
				</button>
			</div>

			<button class="done action" on:click={() => closeAllModals()} use:Ripple={$ripple}>
				{$lang('done')}
			</button>
		</div>
	</Modal>
{/if}

<style>
	.shortcut {
		display: flex;
		align-items: center;
	}

	.key {
		border: 1px solid white;
		width: fit-content;
		padding: 0.35em 0.5em 0.4em 0.5em;
		border-radius: 0.5em;
		font-size: 0.6rem;
	}

	a {
		color: rgb(36 167 255);
		font-weight: 500;
	}

	.add-config-buttons {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.config-buttons-group {
		display: flex;
		gap: 0.8rem;
	}

	.action {
		height: fit-content;
		align-self: end;
		margin-top: 2.37rem;
	}

	.template-example {
		background-color: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.29rem 0.4rem 0.2rem 0.4rem;
		border-radius: 0.4rem;
		color: rgb(255, 255, 255);
		cursor: pointer;
		font-family: monospace;
		font-size: 0.7rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.error {
		background-color: #972828;
		border-radius: 0.6rem;
		padding: 0.6rem 0.65rem 0.5rem 0.65rem;
		margin-bottom: 0.7rem;
		font-size: 0.75rem;
		font-family: monospace;
	}

	.yellow {
		color: rgb(224, 188, 121);
	}

	.green {
		color: rgb(151, 194, 120);
	}

	.red {
		color: rgb(221, 106, 115);
	}

	.purple {
		color: rgb(181, 111, 202);
	}
</style>
