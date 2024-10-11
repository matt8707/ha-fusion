/**
 * Trap tab selection to elements inside modal
 * doesn't work in Safari...
 */
export function trapFocus(node: HTMLElement) {
	function focusable() {
		return Array.from(
			node.querySelectorAll('button:not([tabindex="-1"]), [href], input, select, textarea')
		).map((element) => element as HTMLElement);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const current = document.activeElement as HTMLElement;

		const elements = focusable();
		const first = elements.at(0);
		const last = elements.at(-1);

		if (event.shiftKey && current === first) {
			last?.focus();
			event.preventDefault();
		}

		if (!event.shiftKey && current === last) {
			first?.focus();
			event.preventDefault();
		}
	}

	focusable()[0]?.focus();

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		}
	};
}
