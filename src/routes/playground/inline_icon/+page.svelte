<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	let input =
		'this is a dog <icon style="color: red;">mdi:dog</icon> and this is a cat <icon>fluent-emoji:grinning-cat-with-smiling-eyes</icon>';
	let output: HTMLDivElement;

	const regex = /(\s*)<icon(?: style="([^"]*)")?>([^<]+)<\/icon>(\s*)|<[^>]+>|([^<]+)/g;

	function renderIcon(input: string) {
		const matches = [...input.matchAll(regex)];

		if (matches.length === 0) return;

		output.innerHTML = '';

		matches.forEach((match) => {
			// extracted style
			const style = match[2];

			// extracted icon text
			const iconText = match[3];

			if (iconText) {
				// container
				const span = document.createElement('span');
				const size = '2rem';

				// default
				span.style.cssText = `
					display: inline-flex;
					width: ${size};
					height: ${size};
					vertical-align: middle;
					margin: 0 0.05rem;
				`;

				// user styles
				if (style) {
					span.style.cssText += style;
				}

				// whitespace before
				if (match[1]) {
					output.appendChild(document.createTextNode(match[1]));
				}

				// component
				new Icon({
					target: span,
					props: {
						icon: iconText
					}
				});

				output.appendChild(span);

				// whitespace after
				if (match[4]) {
					output.appendChild(document.createTextNode(match[4]));
				}
			} else if (match[5]) {
				// if html tag, append as-is
				if (match[5].startsWith('<') && match[5].endsWith('>')) {
					const div = document.createElement('div');
					div.innerHTML = match[5];
					if (div?.firstChild) output.appendChild(div.firstChild);
				} else {
					// text
					output.appendChild(document.createTextNode(match[5]));
				}
			}
		});
	}

	$: if (browser && input && output) renderIcon(input);
</script>

<textarea bind:value={input}></textarea>
<div bind:this={output}></div>

<style>
	textarea {
		width: 100%;
		height: 5rem;
	}

	div {
		font-size: 1.5rem;
		margin-top: 1.5rem;
	}
</style>
