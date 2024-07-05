<script lang="ts">
	import { autocompleteOpen, pasteContent } from '$lib/Stores';
	import { onMount, onDestroy } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import { EditorState } from '@codemirror/state';
	import { autocompletion, completeFromList, completionStatus } from '@codemirror/autocomplete';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { StreamLanguage } from '@codemirror/language';
	import type { Diagnostic } from '@codemirror/lint';
	import { createEventDispatcher } from 'svelte';
	import { linter, lintGutter } from '@codemirror/lint';

	export let type: string;
	export let value: any;
	export let transitionend: boolean;
	export let autocompleteList: any = undefined;
	export let init: any = undefined;
	export let reloadView: boolean | undefined = undefined;

	let editor: HTMLDivElement;
	let view: EditorView | null;
	let timeout: ReturnType<typeof setTimeout>;

	$: if (transitionend) {
		// focus on transitionend
		if (view) {
			view.focus();
		}
	}

	// figure out how to update codemirror properly
	$: if (view && reloadView && init) {
		// current
		const { anchor, head } = view.state.selection.main;
		const scrollTop = view.scrollDOM.scrollTop;
		const scrollLeft = view.scrollDOM.scrollLeft;

		// update full text
		view.dispatch({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: init
			}
		});

		// restore
		view.dispatch({
			selection: { anchor: anchor, head: head }
		});
		view.scrollDOM.scrollTop = scrollTop;
		view.scrollDOM.scrollLeft = scrollLeft;

		// reset trigger
		reloadView = false;
	}

	const colors = {
		activeLine: 'rgba(255, 255, 255, 0.05)',
		gutterBackground: 'rgb(255, 255, 255, 0)',
		background: 'transparent',
		gutter: '#13141690',
		padding: '0.2rem 0.2rem',
		selection: '#3E4451',
		cursor: '#528bff',
		tooltipBackground: '#353a42',
		highlightBackground: '#2c313a',
		darkBackground: '#21252b',
		stone: '#7d8799',
		ivory: '#abb2bf'
	};

	const styles = EditorView.theme(
		{
			'&': {
				color: colors.ivory,
				backgroundColor: colors.background
			},

			'.cm-content': {
				caretColor: colors.cursor
			},

			'.cm-foldGutter': {
				width: 0
			},

			'.cm-lineNumbers': {
				color: 'rgba(255, 255, 255, 0.25)'
			},

			'.cm-cursor, .cm-dropCursor': { borderLeftColor: colors.cursor },
			'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
				{ backgroundColor: colors.selection },

			'.cm-panels': { backgroundColor: colors.darkBackground, color: colors.ivory },
			'.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
			'.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

			'.cm-searchMatch': {
				backgroundColor: '#72a1ff59',
				outline: '1px solid #457dff'
			},
			'.cm-searchMatch.cm-searchMatch-selected': {
				backgroundColor: '#6199ff2f'
			},

			'.cm-selectionMatch': { backgroundColor: '#aafe661a' },

			'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
				backgroundColor: '#bad0f847'
			},

			'.cm-gutters': {
				backgroundColor: colors.gutterBackground,
				color: colors.stone,
				border: 'none'
			},

			'.cm-activeLine': { backgroundColor: colors.activeLine },

			'.cm-activeLineGutter': {
				backgroundColor: 'transparent'
			},

			'.cm-foldPlaceholder': {
				backgroundColor: 'transparent',
				border: 'none',
				color: '#ddd'
			},

			'.cm-tooltip': {
				border: 'none',
				backgroundColor: colors.tooltipBackground
			},
			'.cm-tooltip .cm-tooltip-arrow:before': {
				borderTopColor: 'transparent',
				borderBottomColor: 'transparent'
			},
			'.cm-tooltip .cm-tooltip-arrow:after': {
				borderTopColor: colors.tooltipBackground,
				borderBottomColor: colors.tooltipBackground
			},
			'.cm-tooltip-autocomplete': {
				'& > ul > li[aria-selected]': {
					backgroundColor: colors.highlightBackground,
					color: colors.ivory
				}
			}
		},
		{ dark: true }
	);

	const dispatch = createEventDispatcher();

	onMount(async () => {
		// shared extensions
		let extensions = [
			basicSetup,
			EditorView.lineWrapping,
			styles,
			keymap.of([indentWithTab]),
			oneDark,
			// update value on input
			EditorState.changeFilter.of((transaction) => {
				const updatedDoc = transaction.state.doc;
				if (view) dispatch('change', updatedDoc.toString());
				return true;
			}),
			autocompletion({
				override: [completeFromList(autocompleteList)],
				maxRenderedOptions: 2000,
				activateOnTyping: false
			}),

			// don't close modal if autocomplete is open and hitting esc
			// debounce because of race condition
			EditorView.updateListener.of((update) => {
				const status = completionStatus(update.state);
				clearTimeout(timeout);
				if (status !== 'active') {
					timeout = setTimeout(() => {
						$autocompleteOpen = false;
					}, 50);
				} else if (status === 'active' && !$autocompleteOpen) {
					$autocompleteOpen = true;
				}
			})
		];

		//  import and push yaml extensions
		if (type === 'yaml') {
			const yamlModule = await import('@codemirror/legacy-modes/mode/yaml');
			const js_yamlModule = await import('js-yaml');

			const lintYaml = linter((view) => {
				const diagnostics: Diagnostic[] = [];
				try {
					js_yamlModule.load(view.state.doc.toString());
				} catch (error: any) {
					const from = error.mark?.position || 0;
					diagnostics.push({
						from: from,
						to: from,
						message: error.message,
						severity: 'error'
					});
				}
				return diagnostics;
			});

			extensions.push(...[StreamLanguage.define(yamlModule.yaml), lintYaml, lintGutter()]);

			// ... or jinja2 extensions
		} else if (type === 'jinja2') {
			const jinja2Module = await import('@codemirror/legacy-modes/mode/jinja2');

			extensions.push(...[StreamLanguage.define(jinja2Module.jinja2)]);
		}

		// codemirror
		view = new EditorView({
			parent: editor,
			state: EditorState.create({
				doc: value,
				extensions
			})
		});

		selectLastLine();

		return view;
	});

	onDestroy(() => {
		if (view) {
			view.destroy();
			view = null;
		}
	});

	function selectLastLine() {
		if (!view) return;

		// auto select last line
		const end = view.state.doc.length;
		view.dispatch({
			selection: {
				anchor: end,
				head: end
			}
		});
	}

	// inserts example template
	$: if ($pasteContent) insertString();

	function insertString() {
		if (!view || !$pasteContent) return;

		// clear
		if ($pasteContent === '__clear__') {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: '' }
			});
			$pasteContent = undefined;
			return;
		}

		// insert
		const range = view.state.selection.ranges[0];
		view.dispatch({
			changes: { from: range.from, to: range.to, insert: $pasteContent },
			selection: { anchor: range.from + $pasteContent.length }
		});
		$pasteContent = undefined;
		view.focus();
	}
</script>

<div class="editor" bind:this={editor}></div>

<style>
	.editor {
		position: relative;
		border-radius: 0.6rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background-color: rgb(17, 17, 17, 0.6);
	}

	:global(.cm-editor) {
		font-size: 0.9rem;
	}

	:global(.cm-scroller) {
		max-height: 69vh !important;
	}

	:global(.cm-tooltip) {
		overflow: hidden !important;
		border-radius: 0.4rem;
	}

	/* circumvent modal 'overflow: hidden' */
	:global(ul[aria-label='Completions']) {
		position: fixed !important;
	}

	:global(ul[aria-label='Completions'] > li[role='option']) {
		background-color: #353a42;
	}
</style>
