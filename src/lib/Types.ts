// configuration.yaml

export interface Configuration {
	hassUrl?: string;
	locale?: string;
	custom_js?: boolean;
	motion?: boolean;
	addons?: Addons;
}

export interface Addons {
	youtube_watching?: {
		entity_id: string;
	};
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

	// HorizontalStack
	type?: string;
	sections?: Section[];
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

export interface ButtonItem {
	type?: string;
	id?: number;
	entity_id?: string;
	name?: string;
	icon?: string;
	color?: string;
	marquee?: boolean;
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
	WeatherItem;

export interface BarItem {
	type?: string;
	id?: number;
	entity_id?: string;
	name?: string;
	math?: string;
}

export interface CameraItem {
	type?: string;
	id?: number;
	entity_id?: string;
	width?: number;
	height?: number;
}

export interface DateItem {
	type?: string;
	id?: number;
	short_day?: boolean;
	short_month?: boolean;
	hide?: string;
}

export interface GraphItem {
	type?: string;
	id?: number;
	entity_id?: string;
	period?: string;
	stroke?: number;
}

export interface HistoryItem {
	type?: string;
	id?: number;
	entity_id?: string;
	period?: string;
}

export interface IframeItem {
	type?: string;
	id?: number;
	url?: string;
	size?: string;
}

export interface ImageItem {
	type?: string;
	id?: number;
	entity_id?: string;
	url?: string;
}

export interface NavigateItem {
	type?: string;
	id?: number;
}

export interface RadialItem {
	type?: string;
	id?: number;
	entity_id?: string;
	name?: string;
	stroke?: number;
}

export interface SensorItem {
	type?: string;
	id?: number;
	entity_id?: string;
	prefix?: string;
	suffix?: string;
	date?: boolean;
}

export interface TemplateItem {
	type?: string;
	id?: number;
	template?: string;
}

export interface TimeItem {
	type?: string;
	id?: number;
	hour12?: boolean;
	seconds?: boolean;
}

export interface TimerItem {
	type?: string;
	id?: number;
	entity_id?: string;
}

export interface WeatherItem {
	type?: string;
	id?: number;
	entity_id?: string;
	state?: string;
	weather_sensor?: string;
	icon_pack?: string;
	extra_sensor?: string;
	extra_sensor_icon?: string;
}
