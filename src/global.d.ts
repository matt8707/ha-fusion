declare module 'svelte-ripple';
declare module 'svelte-confetti';
declare module '@event-calendar/core';
declare module '@event-calendar/day-grid';
declare module '@event-calendar/list';

declare type Item = import('svelte-dnd-action').Item;
declare type DndEvent<ItemType = Item> = import('svelte-dnd-action').DndEvent<ItemType>;
declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		'on:consider'?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
		'on:finalize'?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
	}
}
