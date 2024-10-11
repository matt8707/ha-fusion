import { writable, readable, derived } from 'svelte/store';
import type {
	Configuration,
	Dashboard,
	PersistentNotification,
	Template,
	Translations,
	Views,
	KonvaStore,
	KonvaImageCache
} from '$lib/Types';
import type {
	Connection,
	HassConfig,
	HassEntities,
	HassServices
} from 'home-assistant-js-websocket';
import { getName } from './Utils';

// hass
export const connection = writable<Connection>();
export const config = writable<HassConfig>();
export const states = writable<HassEntities>();
export const services = writable<HassServices>();
export const connected = writable<boolean>();

// user
export const configuration = writable<Configuration>();
export const dashboard = writable<Dashboard>();
export const customJs = writable<boolean | undefined>();

// states
export const onStates = readable([
	'active',
	'auto',
	'cool',
	'dry',
	'fan_only',
	'heat',
	'heat_cool',
	'heating',
	'home',
	'on',
	'open',
	'playing',
	'unlocking',
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

// climate states
export const climateHvacActionToMode = readable<Record<string, string>>({
	cooling: 'cool',
	drying: 'dry',
	fan: 'fan_only',
	preheating: 'heat',
	heating: 'heat',
	idle: 'off',
	off: 'off'
});

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
export const itemHeight = readable(61.35);

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
export const forecasts = writable<{ [key: string]: any }>({});
export const templates = writable<Template>({});
export const demo = writable<{ [key: string]: string | undefined }>({
	graph: undefined,
	sensor: undefined,
	timer: undefined,
	bar: undefined,
	radial: undefined,
	camera: undefined,
	history: undefined
});

// youtube_addon
export const youtubeAddon = writable<boolean | undefined>();
export const youtubeData = writable<{
	media_artist: string;
	media_title: string;
	entity_picture: string;
}>();

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

// calendar
export const calendarView = writable<string | null>();
export const calendarFirstDay = writable<number>();

// dnd
export const dragging = writable<boolean>(false);

// codemirror
export const autocompleteOpen = writable(false);
export const autocompleteList = derived(states, ($states) => Object.keys($states));
export const pasteContent = writable<string | undefined>();

// entity select
export const entityList = derived(
	states,
	($states) => (filter: string) =>
		Object.keys($states)
			?.filter((key) => (filter.length > 0 ? key.startsWith(`${filter}.`) : true))
			?.sort()
			?.map((key) => {
				const name = getName(undefined, $states?.[key]);
				return {
					id: key,
					label: name ?? key,
					hint: name === key ? undefined : key
				};
			})
);

// event
export const event = writable<string | undefined>();
export const persistentNotifications = writable<{
	[notificationId: string]: PersistentNotification;
}>({});

// konva
export const konvaImageCache = writable<KonvaImageCache>({});

export const konvaStore = writable<KonvaStore>({
	children: [],
	selectedShapes: [],
	mode: 'default',
	undoStack: [],
	redoStack: []
});
