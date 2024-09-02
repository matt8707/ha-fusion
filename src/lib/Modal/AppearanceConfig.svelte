<script lang="ts">
	import { base } from '$app/paths';
	import { dashboard, motion, record, lang, ripple } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let highlight = false;
	export let themes: any = undefined;

	$: visibilityNavigate = $dashboard?.hide_views;
	$: visibilitySidebar = $dashboard?.hide_sidebar;

	onMount(async () => {
		// something needs to be selected, set default
		if (!$dashboard.theme) setTheme('godis');

		// load themes if not prop has already loaded
		if (!themes) {
			try {
				const response = await fetch(`${base}/_api/get_all_themes`);
				const data = await response.json();

				if (response.ok) {
					themes = data;
				} else {
					throw new Error(data.message);
				}
			} catch (error) {
				console.error(error);
			}
		}

		mounted = true;
	});

	function setTheme(theme: string) {
		$dashboard.theme = theme;
		$record();
	}

	function handleViews(state: boolean) {
		$dashboard.hide_views = state;
		highlight = false;
		$record();
	}

	function handleSidebar(state: boolean) {
		$dashboard.hide_sidebar = state;
		$record();
	}

	let mounted = false;
	let gallery: HTMLDivElement;
	let buttons: { [key: number]: HTMLButtonElement } = {};

	let top: string;
	let left: string;
	let width: string;
	let height: string;

	$: transition = `all ${$motion}ms cubic-bezier(0.18, 0.89, 0.32, 1.1)`;

	$: if ($dashboard?.theme && mounted) {
		setDimensions(buttons[$dashboard?.theme as any]);
	}

	function setDimensions(element: HTMLElement) {
		if (gallery && element) {
			const elementRect = element.getBoundingClientRect();
			const containerRect = gallery.getBoundingClientRect();
			top = elementRect.top - containerRect.top + 'px';
			left = elementRect.left - containerRect.left + 'px';
			width = elementRect.width + 'px';
			height = elementRect.height + 'px';
		}
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('appearance')}</h1>

		<h2>{$lang('navigate')}</h2>

		<div class:highlight>
			<div class="button-container">
				<button
					class:selected={visibilityNavigate === false}
					on:click={() => handleViews(false)}
					use:Ripple={$ripple}
				>
					{$lang('visible')}
				</button>
				<button
					class:selected={visibilityNavigate === true}
					on:click={() => handleViews(true)}
					use:Ripple={$ripple}
				>
					{$lang('hidden')}
				</button>
			</div>
		</div>

		<h2>{$lang('sidebar')}</h2>
		<div class="button-container">
			<button
				class:selected={visibilitySidebar === false}
				on:click={() => handleSidebar(false)}
				use:Ripple={$ripple}
			>
				{$lang('visible')}
			</button>
			<button
				class:selected={visibilitySidebar === true}
				on:click={() => handleSidebar(true)}
				use:Ripple={$ripple}
			>
				{$lang('hidden')}
			</button>
		</div>

		<h1 style:margin-top="1.9rem">{$lang('theme')}</h1>

		{#if themes}
			<div class="gallery" bind:this={gallery}>
				{#each themes as theme}
					{@const _theme = $dashboard?.theme === theme?.title}
					<button
						use:Ripple={{
							...$ripple,
							opacity: _theme ? '0' : $ripple.opacity
						}}
						class="container"
						bind:this={buttons[theme?.title]}
						on:click={() => {
							setTheme(theme?.title);
						}}
						style:cursor={_theme ? 'unset' : 'pointer'}
						class:selected_theme={!mounted && _theme}
					>
						<div class="theme-container">
							<div class="image-area">
								<picture>
									<source srcset="{base}/themes/{theme?.title}_thumbnail.webp" type="image/webp" />
									<img src="{base}/themes/{theme?.title}_thumbnail.jpg" alt="{theme?.title}" />
								</picture>
							</div>

							<div class="description-area">
								<div class="description">
									<div class="name">{theme?.title}</div>
									<div class="author">{theme?.author}</div>
									<div class="edit-area">
										<div
											use:Ripple={{
												...$ripple,
												color: 'rgba(0, 0, 0, 0.35)'
											}}
											class="edit"
											on:click={() => {
												openModal(() => import('$lib/Modal/ThemeEditor.svelte'), {
													theme: theme
												});
											}}
											on:keydown
											role="button"
											tabindex="0"
										>
											<Icon icon="solar:pen-2-bold-duotone" height="none" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</button>
				{/each}

				{#if mounted}
					<div
						class="navigate selected_theme"
						style:top
						style:left
						style:width
						style:height
						style:transition
					></div>
				{/if}
			</div>
		{/if}

		<ConfigButtons />
	</Modal>
{/if}

<style>
	.selected_theme {
		outline: 2px solid white;
		border-radius: 0.6rem;
		z-index: 1;
	}

	.navigate {
		z-index: 0;
		position: absolute;
		pointer-events: none;
	}

	.gallery {
		position: relative;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 1rem;
		margin-top: 1rem;
	}

	.container {
		position: relative;
		cursor: pointer;
		padding: 0;
		background-color: transparent;
		color: inherit;
		border: none;
		text-align: start;
	}

	.theme-container {
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-areas:
			'image-area'
			'description-area';
		aspect-ratio: 4/3;
		border-radius: 0.6rem;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.image-area {
		grid-area: image-area;
		background-size: cover;
	}

	.description-area {
		grid-area: description-area;
		background-color: #212122;
		padding: 0.7rem 0.9rem 0.8rem 0.9rem;
		border-top: 1px solid var(--border-color-button);
	}

	.description {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'name edit-area'
			'author edit-area';
		align-items: end;
	}

	.name {
		grid-area: name;
		font-size: 1rem;
		margin-bottom: 0.2rem;
	}

	.author {
		grid-area: author;
		font-size: 0.9rem;
		opacity: 0.5;
	}

	.edit-area {
		grid-area: edit-area;
		align-self: center;
	}

	.edit {
		background-color: #ffc107;
		color: #3b0f10;
		border-radius: 0.4rem;
		cursor: pointer;
		border: 1px solid #ffd968;
		width: 2rem;
		height: 2rem;
	}

	@keyframes flash {
		0% {
			outline: 2px solid #ffc008;
		}

		25% {
			outline: 2px solid transparent;
		}

		50% {
			outline: 2px solid #ffc008;
		}

		75% {
			outline: 2px solid transparent;
		}

		100% {
			outline: 2px solid #ffc008;
		}
	}

	.highlight {
		outline: 2px solid #ffc008;
		animation: flash 1.3s ease-in-out forwards;
		animation-delay: 300ms;
		border-radius: 0.6rem;
		outline-offset: 1px;
	}

	h1 {
		margin: 0.35em 0 0.15em 0;
	}
</style>
