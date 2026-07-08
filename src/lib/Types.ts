import type Konva from 'konva';
import type { ShapeConfig } from 'konva/lib/Shape';

// configuration.yaml

export interface Configuration {
	hassUrl?: string;
	locale?: string;
	custom_js?: boolean;
	motion?: boolean;
	addons?: Addons;
	token?: string;
}

export interface Addons {
	youtube?: boolean;
	maptiler?: {
		apikey: string;
	};
}

export interface Dashboard {
	views: Views[];
	sidebar: SidebarItem[];
	theme?: string;
	hide_views?: boolean;
	hide_sidebar?: boolean;
	sidebarWidth?: number;
}

export interface Views {
	id?: number;
	name?: string;
	icon?: string;
	sections?: Section[];
	isDndShadowItem?: boolean;
}

export interface Section {
	id?: number;
	name?: string;
	items?: Item[];
	visibility?: {
		conditions?: Condition[];
	}[];
	item_visibility_template?: {
		conditions?: Condition[];
	}[];

	// HorizontalStack
	type?: string;
	sections?: Section[];
}

export interface Condition {
	condition?: 'state' | 'numeric_state' | 'screen' | 'or' | 'and';
	conditions?: Condition[];
	id?: number;
	entity?: string;
	state?: string;
	state_not?: string;
	media_query?: string;
	above?: number;
	below?: number;
	collapsed?: boolean;
}

export interface Translations {
	[key: string]: string;
}

// dashboard.yaml

export interface ViewItem {
	id?: number;
	name?: string;
	icon?: string;
	sections?: any[];
}

export interface EmptyItem {
	id?: number;
}

export interface ButtonItem {
	type: string;
	id: number;
	entity_id: string;
	name?: string;
	icon?: string;
	color?: string;
	marquee?: boolean;
	more_info?: boolean;
	service?: string;
	state: any;
	template?: {
		[key: string]: {
			set_state?: string;
			state?: string;
			name?: string;
			icon?: string;
			color?: string;
			service?: string;
		};
	};
	visibility?: {
		conditions?: Condition[];
	}[];
}

export interface Template {
	[id: number]: {
		[key: string]: {
			input: string | undefined;
			output: string | undefined;
			error: string | undefined;
			entity_id: string | undefined;
		};
	};
}

export interface PersistentNotification {
	created_at: string;
	message: string;
	notification_id: string;
	title: string;
	status: 'read' | 'unread';
}

export type SidebarItem = BarItem &
	CameraItem &
	DateItem &
	GraphItem &
	HistoryItem &
	IframeItem &
	ImageItem &
	NavigateItem &
	RadialItem &
	SensorItem &
	TemplateItem &
	TimeItem &
	WeatherItem &
	WeatherForecastItem &
	DividerItem;

export interface BarItem {
	type?: string;
	id?: number;
	entity_id?: string;
	name?: string;
	math?: string;
	hide_mobile?: boolean;
}

export interface CameraItem {
	type?: string;
	id?: number;
	entity_id?: string;
	stream?: boolean;
	size?: string;
	hide_mobile?: boolean;
}

export interface DateItem {
	type?: string;
	id?: number;
	short_day?: boolean;
	short_month?: boolean;
	hide?: string;
	layout?: string;
	hide_mobile?: boolean;
}

export interface GraphItem {
	name?: string;
	type?: string;
	id?: number;
	entity_id?: string;
	period?: string;
	stroke?: number;
	hide_mobile?: boolean;
}

export interface HistoryItem {
	type?: string;
	id?: number;
	entity_id?: string;
	period?: string;
	hide_mobile?: boolean;
}

export interface IframeItem {
	type?: string;
	id?: number;
	url?: string;
	size?: string;
	hide_mobile?: boolean;
}

export interface ImageItem {
	type?: string;
	id?: number;
	entity_id?: string;
	url?: string;
	hide_mobile?: boolean;
}

export interface DividerItem {
	type?: string;
	id?: number;
	mode?: string;
	size?: number;
	hide_mobile?: boolean;
}

export interface NavigateItem {
	type?: string;
	id?: number;
	hide_mobile?: boolean;
}

export interface RadialItem {
	type?: string;
	id?: number;
	entity_id?: string;
	name?: string;
	stroke?: number;
	hide_mobile?: boolean;
}

export interface SensorItem {
	type?: string;
	id?: number;
	entity_id?: string;
	prefix?: string;
	suffix?: string;
	date?: boolean;
	hide_mobile?: boolean;
}

export interface TemplateItem {
	type?: string;
	id?: number;
	template?: string;
	hide_mobile?: boolean;
}

export interface TimeItem {
	type?: string;
	id?: number;
	hour12?: boolean;
	seconds?: boolean;
	hide_mobile?: boolean;
}

export interface TimerItem {
	type?: string;
	id?: number;
	entity_id?: string;
	hide_mobile?: boolean;
}

export interface WeatherItem {
	type?: string;
	id?: number;
	entity_id?: string;
	state?: string;
	icon_pack?: string;
	sensor?: string;
	icon?: string;
	show_apparent?: boolean;
	hide_mobile?: boolean;
}

export interface WeatherForecastItem {
	type?: string;
	id?: number;
	entity_id?: string;
	state?: string;
	icon_pack?: string;
	days_to_show?: number;
	hide_mobile?: boolean;
}

export interface YouTubeEvent {
	message: 'auth-pending' | 'auth' | 'update-credentials' | 'auth-error' | 'error';
	verification_url?: string;
	user_code?: string;
	timestamp?: number;
	error?: any;
}

export type KonvaMode = 'default' | 'pan' | 'zoom';

export interface KonvaImageCache {
	[selId: string]: {
		[id: string]: HTMLImageElement;
	};
}

export interface KonvaHistory {
	elements: Konva.Node[];
	selectedShapes: string[];
}

export interface KonvaStore {
	children: Konva.Node[];
	selectedShapes: ShapeConfig[];
	mode: KonvaMode;
	undoStack: KonvaHistory[];
	redoStack: KonvaHistory[];
}
