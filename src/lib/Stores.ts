import { writable, readable, derived } from 'svelte/store';
import type { Configuration, Dashboard, Translations, Views } from '$lib/Types';
import type { Connection, HassConfig, HassEntities } from 'home-assistant-js-websocket';

// hass
export const connection = writable<Connection>();
export const config = writable<HassConfig>();
export const states = writable<HassEntities>();

export const connected = writable<boolean>();
export const authCallback = writable(false);

// user
export const configuration = writable<Configuration>();
export const dashboard = writable<Dashboard>();
export const customJs = writable<boolean | undefined>();

// states
export const onStates = readable([
	'active',
	'auto',
	'cool',
	'cooling',
	'dry',
	'drying',
	'fan',
	'fan_only',
	'heat',
	'heat_cool',
	'heating',
	'home',
	'on',
	'open',
	'playing',
	'preheating',
	'unlocked',
	// vacuum
	'cleaning',
	'returning',
	// water_heater
	'eco',
	'electric',
	'performance',
	'high_demand',
	'heat_pump',
	'gas'
]);

// drawer
export const drawerSearch = writable<string | undefined>();
export const focusSearch = writable<boolean>(false);
export const filterDashboard = writable<Views>({});
export const disableMenuButton = writable<boolean>(false);
export const clickOriginatedFromMenu = writable<boolean>(false);

// global
export const editMode = writable(false);
export const showDrawer = writable(false);
export const motion = writable(190);
export const itemHeight = readable(65);

// language
export const translation = writable<Translations>({});
export const selectedLanguage = writable<string>();
export const lang = derived(
	translation,
	(obj: Translations & { _default?: Record<string, string> }) => (key: string) =>
		obj[key] || obj._default?.[key] || key
);

// views
export const currentViewId = writable<number | undefined>();
export const draggingView = writable<boolean>(false);
export const viewUnderline = writable<boolean>(true);
export const highlightView = writable<boolean>(false);

// sidebar
export const timers = writable<{ [key: string]: { pausedState: string } }>({});
export const barErrors = writable<{ [key: string]: string }>({});
export const templates = writable<{ [key: number]: string }>({});
export const demo = writable<{ [key: string]: string | undefined }>({
	graph: undefined,
	sensor: undefined,
	timer: undefined,
	bar: undefined,
	radial: undefined,
	camera: undefined,
	history: undefined
});

// history
export const history = writable<string[]>([]);
export const historyIndex = writable<number>(0);
export const record = writable<() => void>(() => {});
export function historyUpdater(func: () => void) {
	record.set(func);
}

// time/date
export const timer = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);
	set(new Date());
	return function stop() {
		clearInterval(interval);
	};
});

// ripple
export const ripple = readable({
	color: 'rgba(255, 255, 255, 0.15)',
	opacity: 0.5,
	spreadingDuration: '300ms',
	spreadingTimingFunction: 'ease-in-out',
	clearingDuration: '350ms',
	clearingTimingFunction: 'ease-in-out'
});

// dnd
export const dragging = writable<boolean>(false);

// codemirror
export const autocompleteOpen = writable(false);
export const autocompleteList = derived(states, ($states) => Object.keys($states));

// event
export const event = writable<string | undefined>();
