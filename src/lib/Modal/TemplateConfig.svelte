<script lang="ts">
	import { dashboard, record, lang, autocompleteList, ripple } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Template from '$lib/Sidebar/Template.svelte';
	import CodeEditor from '$lib/Components/CodeEditor.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { updateObj } from '$lib/Utils';
	import type { TemplateItem } from '$lib/Types';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: TemplateItem;

	let value = sel?.template;
	let modalTransitionEnd = false;

	function handleEvent() {
		modalTransitionEnd = true;
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	onDestroy(() => $record());
</script>

{#if isOpen}
	<Modal on:transitionend={handleEvent}>
		<h1 slot="title">{$lang('template')}</h1>

		<h2>
			{$lang('preview')}
		</h2>

		<div class="preview">
			<Template {sel} />
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

		<h2>{$lang('template_editor')}</h2>

		<CodeEditor
			bind:value
			type="jinja2"
			transitionend={modalTransitionEnd}
			autocompleteList={$autocompleteList}
			on:change={(event) => {
				value = event.detail;
				set('template', value);
			}}
		/>

		<h2>{$lang('mobile')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.hide_mobile !== true}
				on:click={() => set('hide_mobile')}
				use:Ripple={$ripple}
			>
				{$lang('visible')}
			</button>

			<button
				class:selected={sel?.hide_mobile === true}
				on:click={() => set('hide_mobile', true)}
				use:Ripple={$ripple}
			>
				{$lang('hidden')}
			</button>
		</div>

		<ConfigButtons {sel} />
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

	.preview {
		overflow-y: scroll;
		max-height: 8rem;
		pointer-events: unset !important;
		background-color: rgb(0, 0, 0, 0.15);
		border-radius: 0.6rem;
		padding: 0rem 1rem;
	}
</style>
