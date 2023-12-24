<script lang="ts">
	import { onMount } from 'svelte';
	import Preview from '$lib/Playground/Preview.svelte';
	import iro from '@jaames/iro';

	export let data: any;

	let theme = data?.theme;

	let module: iro.ColorPicker;
	let colorPicker: HTMLDivElement;
	let inputs: { [key: string]: HTMLInputElement } = {};

	let selectedKey: string | undefined;
	let selectedValue: string | undefined;
	let selectedColorObject: any;

	let modalHeight: number;

	let visibility = false;

	let top = '0px';
	let left = '0px';

	onMount(() => {
		module = iro.ColorPicker(colorPicker, {
			width: 260,
			boxHeight: 170,
			color: selectedValue,
			borderWidth: 1,
			layout: [
				{
					component: iro.ui.Box
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'hue'
					}
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'alpha'
					}
				}
			]
		});

		module.on('color:change', (color: any) => {
			const { r, g, b, a } = color.rgba;
			selectedValue = `rgba(${r}, ${g}, ${b}, ${a})`;

			if (selectedKey) {
				selectedColorObject[selectedKey] = selectedValue;
				theme = theme;
			}
		});
	});

	function handleClick(parent: any, property: string, colorKey: string) {
		const uniqueKey = `${property}-${colorKey}`;

		selectedColorObject = parent;
		selectedKey = colorKey;

		colorPicker.style.transition = visibility ? 'all 150ms ease' : 'opacity 150ms ease';

		try {
			module.color.set(parent[selectedKey]);
			inputs[uniqueKey].focus();

			// popover
			const rect = inputs[uniqueKey].getBoundingClientRect();
			const padding = 5;

			if (rect.bottom + window.scrollY + modalHeight > window.innerHeight + window.scrollY) {
				top = rect.top + window.scrollY - modalHeight - padding + 'px';
			} else {
				top = padding + rect.bottom + window.scrollY + 'px';
			}

			left = rect.left + window.scrollX + 'px';
			visibility = true;

			// handle invalid color
			inputs[uniqueKey].style.color = 'white';
		} catch (error) {
			console.error(error);
			visibility = false;
			inputs[uniqueKey].focus();
			inputs[uniqueKey].style.color = 'red';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			visibility = false;
			(document.activeElement as HTMLInputElement)?.blur();
		}
	}

	function handleBlur() {
		visibility = false;
	}

	function handleChange(event: any, key: any) {
		data.theme[key] = event.target.value;
		theme = theme;
	}

	let selectedThemeKey = '';

	function handleThemeButtonClick(key: string) {
		selectedThemeKey = key;
	}
</script>

<svelte:document on:keydown={handleKeydown} />

<h1>{theme.title || 'ㅤ'}</h1>

<div class="grid-container">
	{#each Object.entries(data.theme) as [key, value]}
		{#if key !== 'theme'}
			<div class="container">
				<div class="name">{key}</div>

				<div style="display:flex; gap:0.6rem">
					<button class="checkerboard" style="visibility:hidden">
						<div class="swatch" />
					</button>

					<input
						type="text"
						{value}
						spellcheck="false"
						on:input={(event) => handleChange(event, key)}
					/>
				</div>
			</div>
		{/if}
	{/each}
</div>

<h2>Preview</h2>

<Preview theme={theme?.theme} />

<div style:margin-top="1rem">
	{#each Object.keys(theme.theme) as themeKey, index}
		{#if index === 0}
			<button class="section" on:click={() => (selectedThemeKey = '')}>all</button>
		{/if}
		<button class="section" on:click={() => handleThemeButtonClick(themeKey)}>{themeKey}</button>
	{/each}
</div>

<div class="grid-container">
	{#each Object.entries(theme.theme) as [property, propertyValue]}
		{#if property === selectedThemeKey || selectedThemeKey === ''}
			<h2>{property}</h2>
			<div />

			{#if propertyValue}
				{#each Object.entries(propertyValue) as [key, value]}
					{#if key === 'color' && value}
						{#each Object.entries(value) as [colorKey, colorValue]}
							<div class="container">
								<div class="name">
									{colorKey}-color:
								</div>

								<div style:display="flex" style:gap="0.6rem">
									<button
										class="checkerboard"
										on:mousedown|preventDefault={() =>
											handleClick(theme.theme[property].color, property, colorKey)}
									>
										<div class="swatch" style:background-color={String(colorValue)} />
									</button>
									<input
										type="text"
										name={`${property}-${colorKey}`}
										spellcheck="false"
										bind:this={inputs[`${property}-${colorKey}`]}
										bind:value={colorValue}
										on:blur={handleBlur}
									/>
								</div>
							</div>
						{/each}
					{:else}
						<div class="container">
							<div class="name">
								{key}:
							</div>

							<div style:display="flex" style:gap="0.6rem">
								<button class="checkerboard" style:visibility="hidden" />

								<input
									type="text"
									name={`${property}-${key}`}
									spellcheck="false"
									bind:this={inputs[`${property}-${key}`]}
									bind:value={theme.theme[property][key]}
								/>
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		{/if}
	{/each}
</div>

<br />

<button
	on:click={() => {
		console.debug(theme);
	}}>save (log)</button
>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:mousedown|preventDefault
	bind:this={colorPicker}
	bind:clientHeight={modalHeight}
	class="modal"
	style:opacity={visibility ? '1' : '0'}
	style:pointer-events={visibility ? 'unset' : 'none'}
	style:top
	style:left
/>

<style>
	h1 {
		color: white;
	}

	h2 {
		color: bisque;
		margin-block-start: 1.2rem;
		margin-block-end: 0.2rem;
		font-size: 1rem;
	}

	.name {
		color: #c4c4c4;
		align-self: center;
		font-weight: 500;
		font-size: 0.93rem;
	}

	.modal {
		padding: 0.3rem;
		border-radius: 1.1rem;
		width: min-content;
		background-color: #5c5c5c;
		position: absolute;
		box-shadow:
			rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
			rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
	}

	.grid-container {
		display: grid;
		grid-template-columns: max-content auto;
		column-gap: 0.6rem;
		row-gap: 0.4rem;
	}

	.container {
		display: contents;
	}

	.section {
		background-color: rgba(0, 0, 0, 0.25);
		border: none;
		padding: 0.5rem 0.8rem;
		border-radius: 0.6rem;
		color: white;
		margin-right: 0.2rem;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.checkerboard {
		padding: 0;
		cursor: pointer;
		border: 1.5px solid white;
		border-radius: 50%;
		overflow: hidden;
		background: conic-gradient(
				rgb(204, 204, 204) 25%,
				rgb(255, 255, 255) 0deg,
				rgb(255, 255, 255) 50%,
				rgb(204, 204, 204) 0deg,
				rgb(204, 204, 204) 75%,
				rgb(255, 255, 255) 0deg
			)
			0% 0% / 8px 8px;
		width: 1.5rem;
		height: 1.5rem;
	}

	.swatch {
		width: 100%;
		height: 100%;
	}

	input {
		background-color: rgb(255, 255, 255, 0.1);
		color: white;
		border: none;
		border-radius: 0.6rem;
		padding: 0 0.8rem;
		font-size: 0.9rem;
		font-family: monospace;
		width: 100%;
	}
</style>
