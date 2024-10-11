import type { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { getDomain } from '$lib/Utils';

/**
 * New computeIcon.ts for picture elements
 * This should replace computeIcon.svelte
 */

// https://github.com/home-assistant/frontend/blob/dev/src/common/const.ts
const FIXED_DOMAIN_ICONS: Record<string, string> = {
	air_quality: 'air-filter',
	alert: 'alert',
	automation: 'robot',
	calendar: 'calendar',
	climate: 'thermostat',
	configurator: 'cog',
	conversation: 'forum-outline',
	counter: 'counter',
	date: 'calendar',
	datetime: 'calendar-clock',
	demo: 'home-assistant',
	device_tracker: 'account',
	google_assistant: 'google-assistant',
	group: 'google-circles-communities',
	homeassistant: 'home-assistant',
	homekit: 'home-automation',
	image_processing: 'image-filter-frames',
	image: 'image',
	input_boolean: 'toggle-switch',
	input_button: 'button-pointer',
	input_datetime: 'calendar-clock',
	input_number: 'ray-vertex',
	input_select: 'format-list-bulleted',
	input_text: 'rorm-textbox',
	lawn_mower: 'robot-mower',
	light: 'lightbulb',
	notify: 'comment-alert',
	number: 'ray-vertex',
	persistent_notification: 'bell',
	person: 'account',
	plant: 'flower',
	proximity: 'apple-safari',
	remote: 'remote',
	scene: 'palette',
	schedule: 'calendar-clock',
	script: 'script-text',
	select: 'format-list-bulleted',
	sensor: 'eye',
	simple_alarm: 'bell',
	siren: 'bullhorn',
	stt: 'microphone-message',
	sun: 'white-balance-sunny',
	text: 'form-textbox',
	time: 'clock',
	timer: 'timer-outline',
	todo: 'clipboard-list',
	tts: 'speaker-message',
	vacuum: 'robot-vacuum',
	wake_word: 'chat-sleep',
	weather: 'weather-partly-cloudy',
	zone: 'map-marker-radius'
};

const FIXED_DEVICE_CLASS_ICONS: Record<string, string> = {
	apparent_power: 'flash',
	aqi: 'air-filter',
	atmospheric_pressure: 'thermometer-lines',
	carbon_dioxide: 'molecule-co2',
	carbon_monoxide: 'molecule-co',
	current: 'current-ac',
	data_rate: 'transmission-tower',
	data_size: 'database',
	date: 'calendar',
	distance: 'arrow-left-right',
	duration: 'progress-clock',
	energy: 'lightning-bolt',
	frequency: 'sine-wave',
	gas: 'meter-gas',
	humidity: 'water-percent',
	illuminance: 'brightness-5',
	irradiance: 'sun-wireless',
	moisture: 'water-percent',
	monetary: 'cash',
	nitrogen_dioxide: 'molecule',
	nitrogen_monoxide: 'molecule',
	nitrous_oxide: 'molecule',
	ozone: 'molecule',
	ph: 'ph',
	pm1: 'molecule',
	pm10: 'molecule',
	pm25: 'molecule',
	power: 'flash',
	power_factor: 'angle-acute',
	precipitation: 'weather-rainy',
	precipitation_intensity: 'weather-pouring',
	pressure: 'gauge',
	reactive_power: 'flash',
	shopping_List: 'format-list-checkbox',
	signal_strength: 'wifi',
	sound_pressure: 'ear-hearing',
	speed: 'speedometer',
	sulphur_dioxide: 'molecule',
	temperature: 'thermometer',
	timestamp: 'clock',
	volatile_organic_compounds: 'molecule',
	volatile_organic_compounds_parts: 'molecule',
	voltage: 'sine-wave',
	volume: 'car-coolant-level',
	volume_flow_rate: 'pipe',
	water: 'water',
	weight: 'weight',
	wind_speed: 'weather-windy'
};

const STATE_ICONS: Record<string, (stateObj: HassEntity) => string> = {
	alarm_control_panel: handleAlarmControlPanel,
	automation: handleAutomation,
	binary_sensor: handleBinarySensor,
	button: handleButton,
	calendar: handleCalendar,
	camera: handleCamera,
	climate: handleClimate,
	cover: handleCover,
	device_tracker: handleDeviceTracker,
	event: handleEvent,
	fan: handleFan,
	humidifier: handleHumidifier,
	input_boolean: handleInputBoolean,
	input_datetime: handleInputDatetime,
	lock: handleLock,
	media_player: handleMediaPlayer,
	person: handlePerson,
	script: handleScript,
	sensor: handleSensor,
	sun: handleSun,
	switch: handleSwitch,
	update: handleUpdate,
	valve: handleValve,
	water_heater: handleWaterHeater,
	weather: handleWeather
};

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/device_tracker_icon.ts
function handleDeviceTracker(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	if (attributes?.source_type === 'router') {
		return state === 'home' ? 'lan-connect' : 'lan-disconnect';
	}
	if (['bluetooth', 'bluetooth_le'].includes(attributes?.source_type)) {
		return state === 'home' ? 'bluetooth-connect' : 'bluetooth';
	}
	return state === 'not_home' ? 'account-arrow-right' : 'account';
}

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_icon.ts
function handleInputDatetime(stateObj: HassEntity) {
	const { attributes } = stateObj;

	if (!attributes?.has_date) {
		return 'clock';
	}
	if (!attributes?.has_time) {
		return 'calendar';
	}
	return FIXED_DOMAIN_ICONS['input_datetime'];
}

function handleSun(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'above_horizon' ? 'white-balance-sunny' : 'weather-night';
}

function handleUpdate(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	const updateIsInstalling =
		((attributes.supported_features ?? 0) & 4 && typeof attributes.in_progress === 'number') ||
		!!attributes.in_progress;

	return state === 'on' ? (updateIsInstalling ? 'package-down' : 'package-up') : 'package';
}

// https://github.com/home-assistant/frontend/blob/dev/src/fake_data/entity_component_icons.ts
function handleAlarmControlPanel(stateObj: HassEntity) {
	const { state } = stateObj;

	switch (state) {
		case 'armed_away':
			return 'shield-lock';
		case 'armed_custom_bypass':
			return 'security';
		case 'armed_home':
			return 'shield-home';
		case 'armed_night':
			return 'shield-moon';
		case 'armed_vacation':
			return 'shield-airplane';
		case 'disarmed':
			return 'shield-off';
		case 'pending':
			return 'shield-outline';
		case 'triggered':
			return 'bell-ring';
		default:
			return 'shield';
	}
}

function handleAutomation(stateObj: HassEntity) {
	const { state } = stateObj;
	if (state === 'unavailable') return 'robot-confused';
	return state === 'on' ? FIXED_DOMAIN_ICONS['automation'] : 'robot-off';
}

function handleInputBoolean(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'on' ? 'check-circle-outline' : 'close-circle-outline';
}

function handlePerson(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'not_home' ? 'account-arrow-right' : FIXED_DOMAIN_ICONS['person'];
}

function handleCamera(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'off' ? 'video-off' : 'video';
}

function handleFan(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'off' ? 'fan-off' : 'fan';
}

function handleHumidifier(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'off' ? 'air-humidifier-off' : 'air-humidifier';
}

function handleButton(stateObj: HassEntity) {
	const { attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'restart':
			return 'restart';
		case 'update':
			return 'package-up';
		case 'identify':
			return 'crosshairs-question';
		default:
			return 'button-pointer';
	}
}

function handleEvent(stateObj: HassEntity) {
	const { attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'button':
			return 'gesture-tap-button';
		case 'doorbell':
			return 'doorbell';
		case 'motion':
			return 'motion-sensor';
		default:
			return 'eye-check';
	}
}

function handleLock(stateObj: HassEntity) {
	const { state } = stateObj;

	switch (state) {
		case 'jammed':
			return 'lock-alert';
		case 'unlocked':
			return 'lock-open';
		case 'locking':
		case 'unlocking':
		case 'opening':
			return 'lock-clock';
		case 'open':
			return 'lock-open-variant';
		default:
			return 'lock';
	}
}

function handleWaterHeater(stateObj: HassEntity) {
	const { state } = stateObj;
	return state === 'off' ? 'water-boiler-off' : 'water-boiler';
}

function handleValve(stateObj: HassEntity) {
	const { attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'gas':
			return 'meter-gas';
		case 'water':
			return 'pipe-valve';
		default:
			return 'pipe-valve';
	}
}

function handleSwitch(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'switch':
			return state === 'on' ? 'toggle-switch-variant' : 'toggle-switch-variant-off';
		case 'outlet':
			return state === 'on' ? 'power-plug' : 'power-plug-off';
		default:
			return 'toggle-switch-variant';
	}
}

function handleMediaPlayer(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'receiver':
			switch (state) {
				case 'off':
					return 'audio-video-off';
				default:
					return 'audio-video';
			}
		case 'speaker':
			switch (state) {
				case 'off':
					return 'speaker-off';
				case 'paused':
					return 'speaker-pause';
				case 'playing':
					return 'speaker-play';
				default:
					return 'speaker';
			}
		case 'tv':
			switch (state) {
				case 'off':
					return 'television-off';
				case 'paused':
					return 'television-pause';
				case 'playing':
					return 'television-play';
				default:
					return 'television';
			}
		default:
			switch (state) {
				case 'off':
					return 'cast-off';
				case 'playing':
				case 'paused':
					return 'cast-connected';
				default:
					return 'cast';
			}
	}
}

// https://github.com/home-assistant/frontend/blob/dev/src/common/entity/battery_icon.ts
function batteryIcon(state: number | string, attributes: any) {
	const BATTERY_ICONS: Record<number, string> = {
		10: 'battery-10',
		20: 'battery-20',
		30: 'battery-30',
		40: 'battery-40',
		50: 'battery-50',
		60: 'battery-60',
		70: 'battery-70',
		80: 'battery-80',
		90: 'battery-90',
		100: 'battery'
	};

	const BATTERY_CHARGING_ICONS: Record<number, string> = {
		10: 'battery-charging-10',
		20: 'battery-charging-20',
		30: 'battery-charging-30',
		40: 'battery-charging-40',
		50: 'battery-charging-50',
		60: 'battery-charging-60',
		70: 'battery-charging-70',
		80: 'battery-charging-80',
		90: 'battery-charging-90',
		100: 'battery-charging'
	};

	const batteryValue = Number(state);
	if (isNaN(batteryValue)) {
		if (state === 'off') {
			return 'battery';
		}
		if (state === 'on') {
			return 'battery-alert';
		}
		return 'battery-unknown';
	}

	const batteryRound = Math.round(batteryValue / 10) * 10;
	if (attributes?.is_charging && batteryValue >= 10) {
		return BATTERY_CHARGING_ICONS[batteryRound];
	}
	if (attributes?.is_charging) {
		return 'battery-charging-outline';
	}
	if (batteryValue <= 5) {
		return 'battery-alert-variant-outline';
	}
	return BATTERY_ICONS[batteryRound];
}

function handleSensor(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	if (attributes?.device_class === 'battery') {
		return batteryIcon(state, attributes);
	}

	if (attributes?.unit_of_measurement === '°C' || attributes?.unit_of_measurement === '°F') {
		return 'thermometer';
	}

	return FIXED_DOMAIN_ICONS['sensor'];
}

function handleWeather(stateObj: HassEntity): string {
	const { state } = stateObj;

	switch (state) {
		case 'clear-night':
			return 'weather-night';
		case 'cloudy':
			return 'weather-cloudy';
		case 'exceptional':
			return 'alert-circle-outline';
		case 'fog':
			return 'weather-fog';
		case 'hail':
			return 'weather-hail';
		case 'lightning':
			return 'weather-lightning';
		case 'lightning-rainy':
			return 'weather-lightning-rainy';
		case 'pouring':
			return 'weather-pouring';
		case 'rainy':
			return 'weather-rainy';
		case 'snowy':
			return 'weather-snowy';
		case 'snowy-rainy':
			return 'weather-snowy-rainy';
		case 'sunny':
			return 'weather-sunny';
		case 'windy':
			return 'weather-windy';
		case 'windy-variant':
			return 'weather-windy-variant';
		default:
			return 'weather-partly-cloudy';
	}
}

function handleCalendar(stateObj: HassEntity): string {
	const { state } = stateObj;

	switch (state) {
		case 'on':
			return 'calendar-check';
		case 'off':
			return 'calendar-blank';
		default:
			return 'calendar';
	}
}

function handleScript(stateObj: HassEntity): string {
	const { state } = stateObj;
	return state === 'on' ? 'script-text-play' : 'script-text';
}

function handleClimate(stateObj: HassEntity): string {
	const { attributes } = stateObj;

	switch (attributes?.hvac_action) {
		case 'cooling':
			return 'snowflake';
		case 'drying':
			return 'water-percent';
		case 'fan':
			return 'fan';
		case 'heating':
			return 'fire';
		case 'idle':
			return 'clock-outline';
		case 'off':
			return 'power';
		case 'preheating':
			return 'heat-wave';
		case 'defrosting':
			return 'snowflake-melt';
	}

	switch (attributes?.preset_mode) {
		case 'activity':
			return 'motion-sensor';
		case 'away':
			return 'account-arrow-right';
		case 'boost':
			return 'rocket-launch';
		case 'comfort':
			return 'sofa';
		case 'eco':
			return 'leaf';
		case 'home':
			return 'home';
		case 'sleep':
			return 'bed';
	}

	return 'thermostat';
}

function handleBinarySensor(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'battery':
			return state === 'on' ? 'battery-outline' : 'battery';
		case 'battery_charging':
			return state === 'on' ? 'battery-charging' : 'battery';
		case 'carbon_monoxide':
			return state === 'on' ? 'smoke-detector-alert' : 'smoke-detector';
		case 'cold':
			return state === 'on' ? 'snowflake' : 'thermometer';
		case 'connectivity':
			return state === 'on' ? 'check-network-outline' : 'close-network-outline';
		case 'door':
			return state === 'on' ? 'door-open' : 'door-closed';
		case 'garage_door':
			return state === 'on' ? 'garage-open' : 'garage';
		case 'gas':
		case 'problem':
		case 'safety':
		case 'tamper':
			return state === 'on' ? 'alert-circle' : 'check-circle';
		case 'power':
		case 'plug':
			return state === 'on' ? 'power-plug' : 'power-plug-off';
		case 'heat':
			return state === 'on' ? 'fire' : 'thermometer';
		case 'light':
			return state === 'on' ? 'brightness-7' : 'brightness-5';
		case 'lock':
			return state === 'on' ? 'lock-open' : 'lock';
		case 'moisture':
			return state === 'on' ? 'water' : 'water-off';
		case 'motion':
			return state === 'on' ? 'motion-sensor' : 'motion-sensor-off';
		case 'moving':
			return state === 'on' ? 'octagon' : 'arrow-right';
		case 'occupancy':
		case 'presence':
			return state === 'on' ? 'home' : 'home-outline';
		case 'opening':
			return state === 'on' ? 'square-outline' : 'square';
		case 'running':
			return state === 'on' ? 'play' : 'stop';
		case 'smoke':
			return state === 'on' ? 'smoke-detector-variant-alert' : 'smoke-detector-variant';
		case 'sound':
			return state === 'on' ? 'music-note' : 'music-note-off';
		case 'update':
			return state === 'on' ? 'package-up' : 'package';
		case 'vibration':
			return state === 'on' ? 'vibrate' : 'crop-portrait';
		case 'window':
			return state === 'on' ? 'window-open' : 'window-closed';
		default:
			return state === 'on' ? 'checkbox-marked-circle' : 'radiobox-blank';
	}
}

function handleCover(stateObj: HassEntity) {
	const { state, attributes } = stateObj;

	switch (attributes?.device_class) {
		case 'blind':
			switch (state) {
				case 'closed':
					return 'blinds-horizontal-closed';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'blinds-horizontal';
			}
		case 'curtain':
			switch (state) {
				case 'closed':
					return 'curtains-closed';
				case 'closing':
					return 'arrow-collapse-horizontal';
				case 'opening':
					return 'arrow-split-vertical';
				default:
					return 'curtains';
			}
		case 'damper':
			return state === 'closed' ? 'circle-slice-8' : 'circle';
		case 'door':
			return state === 'closed' ? 'door-closed' : 'door-open';
		case 'garage':
			switch (state) {
				case 'closed':
					return 'garage';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'garage-open';
			}
		case 'gate':
			switch (state) {
				case 'closed':
					return 'gate';
				case 'closing':
				case 'opening':
					return 'arrow-right';
				default:
					return 'gate-open';
			}
		case 'shade':
			switch (state) {
				case 'closed':
					return 'roller-shade-closed';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'roller-shade';
			}
		case 'shutter':
			switch (state) {
				case 'closed':
					return 'window-shutter';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'window-shutter-open';
			}
		case 'window':
			switch (state) {
				case 'closed':
					return 'window-closed';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'window-open';
			}
		default:
			switch (state) {
				case 'closed':
					return 'window-closed';
				case 'closing':
					return 'arrow-down-box';
				case 'opening':
					return 'arrow-up-box';
				default:
					return 'window-open';
			}
	}
}

export function computeIcon(entity_id: string, $states: HassEntities) {
	const stateObj = $states?.[entity_id];
	const domain = getDomain(entity_id);

	if (!stateObj || !domain) return 'mdi:help-circle-outline';
	const { attributes } = stateObj;

	// icon
	if (attributes?.icon && attributes?.icon?.startsWith('mdi')) {
		return attributes.icon;
	}

	// device class
	if (attributes?.device_class && FIXED_DEVICE_CLASS_ICONS[attributes.device_class]) {
		return `mdi:${FIXED_DEVICE_CLASS_ICONS[attributes.device_class]}`;
	}

	// state
	if (STATE_ICONS[domain] && typeof STATE_ICONS[domain] === 'function') {
		return `mdi:${STATE_ICONS[domain](stateObj)}`;
	}

	// domain
	if (FIXED_DOMAIN_ICONS[domain]) {
		return `mdi:${FIXED_DOMAIN_ICONS[domain]}`;
	}

	// fallback
	return 'mdi:help-circle-outline';
}
