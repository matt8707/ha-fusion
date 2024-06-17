<script lang="ts">
	import { states } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import { getDomain } from '$lib/Utils';
	import { createEventDispatcher, onMount } from 'svelte';

	export let entity_id: string;
	export let getIconString: boolean | undefined = undefined;
	export let skipEntitiyPicture: boolean | undefined = undefined;
	export let size: string | undefined = undefined;

	let stateObj: any;
	let currentIcon: string | undefined;
	let src: string | undefined;

	$: if (entity_id) stateObj = $states?.[entity_id];
	$: state = stateObj?.state;

	const dispatch = createEventDispatcher();

	const FIXED_DEVICE_CLASS_ICONS: any = {
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
		pm1: 'molecule',
		pm10: 'molecule',
		pm25: 'molecule',
		power: 'flash',
		power_factor: 'angle-acute',
		precipitation: 'weather-rainy',
		precipitation_intensity: 'weather-pouring',
		pressure: 'gauge',
		reactive_power: 'flash',
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
		water: 'water',
		weight: 'weight',
		wind_speed: 'weather-windy'
	};

	const BATTERY_ICONS: any = {
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

	const BATTERY_CHARGING_ICONS: any = {
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

	$: ICONS = {
		air_quality: 'air-filter',
		alert: 'alert',
		calendar: 'calendar',
		climate: 'thermostat',
		configurator: 'cog',
		conversation: 'microphone-message',
		counter: 'counter',
		datetime: 'calendar-clock',
		date: 'calendar',
		demo: 'home-assistant',
		google_assistant: 'google-assistant',
		group: 'google-circles-communities',
		homeassistant: 'home-assistant',
		homekit: 'home-automation',
		image: 'image',
		image_processing: 'image-filter-frames',
		input_button: 'gesture-tap-button',
		input_number: 'ray-vertex',
		input_select: 'format-list-bulleted',
		input_text: 'form-textbox',
		lawn_mower: 'robot-mower',
		light: 'lightbulb',
		mailbox: 'mailbox',
		notify: 'comment-alert',
		persistent_notification: 'bell',
		plant: 'flower',
		proximity: 'apple-safari',
		remote: 'remote',
		scene: 'palette',
		schedule: 'calendar-clock',
		script: 'script-text',
		select: 'format-list-bulleted',
		simple_alarm: 'bell',
		siren: 'bullhorn',
		stt: 'microphone-message',
		switch_as_x: 'swap-horizontal',
		text: 'form-textbox',
		todo: 'clipboard-list',
		threshold: 'chart-sankey',
		time: 'clock',
		timer: 'timer-outline',
		tts: 'speaker-message',
		update: 'package',
		updater: 'cloud-upload',
		vacuum: 'robot-vacuum',
		wake_word: 'chat-sleep',
		zone: 'map-marker-radius',
		// dynamic
		alarm_control_panel:
			state === 'armed_away'
				? 'shield-lock'
				: state === 'armed_vacation'
					? 'shield-airplane'
					: state === 'armed_home'
						? 'shield-home'
						: state === 'armed_night'
							? 'shield-moon'
							: state === 'armed_custom_bypass'
								? 'security'
								: state === 'pending'
									? 'shield-outline'
									: state === 'triggered'
										? 'bell-ring'
										: state === 'disarmed'
											? 'shield-off'
											: 'shield',
		automation: state === 'off' ? 'robot-off' : 'robot',
		binary_sensor:
			stateObj?.attributes.device_class === 'battery'
				? state === 'off'
					? 'battery'
					: 'battery-outline'
				: stateObj?.attributes.device_class === 'battery_charging'
					? state === 'off'
						? 'battery'
						: 'battery-charging'
					: stateObj?.attributes.device_class === 'carbon_monoxide'
						? state === 'off'
							? 'smoke-detector'
							: 'smoke-detector-alert'
						: stateObj?.attributes.device_class === 'cold'
							? state === 'off'
								? 'thermometer'
								: 'snowflake'
							: stateObj?.attributes.device_class === 'connectivity'
								? state === 'off'
									? 'close-network-outline'
									: 'check-network-outline'
								: stateObj?.attributes.device_class === 'door'
									? state === 'off'
										? 'door-closed'
										: 'door-open'
									: stateObj?.attributes.device_class === 'garage_door'
										? state === 'off'
											? 'garage'
											: 'garage-open'
										: stateObj?.attributes.device_class === 'power'
											? state === 'off'
												? 'power-plug-off'
												: 'power-plug'
											: ['gas', 'problem', 'safety', 'tamper'].includes(
														stateObj?.attributes.device_class
												  )
												? state === 'off'
													? 'check-circle'
													: 'alert-circle'
												: stateObj?.attributes.device_class === 'smoke'
													? state === 'off'
														? 'smoke-detector-variant'
														: 'smoke-detector-variant-alert'
													: stateObj?.attributes.device_class === 'heat'
														? state === 'off'
															? 'thermometer'
															: 'fire'
														: stateObj?.attributes.device_class === 'light'
															? state === 'off'
																? 'brightness-5'
																: 'brightness-7'
															: stateObj?.attributes.device_class === 'lock'
																? state === 'off'
																	? 'lock'
																	: 'lock-open'
																: stateObj?.attributes.device_class === 'moisture'
																	? state === 'off'
																		? 'water-off'
																		: 'water'
																	: stateObj?.attributes.device_class === 'motion'
																		? state === 'off'
																			? 'motion-sensor-off'
																			: 'motion-sensor'
																		: stateObj?.attributes.device_class === 'occupancy'
																			? state === 'off'
																				? 'home-outline'
																				: 'home'
																			: stateObj?.attributes.device_class === 'opening'
																				? state === 'off'
																					? 'square'
																					: 'square-outline'
																				: stateObj?.attributes.device_class === 'plug'
																					? state === 'off'
																						? 'power-plug-off'
																						: 'power-plug'
																					: stateObj?.attributes.device_class === 'presence'
																						? state === 'off'
																							? 'home-outline'
																							: 'home'
																						: stateObj?.attributes.device_class === 'running'
																							? state === 'off'
																								? 'stop'
																								: 'play'
																							: stateObj?.attributes.device_class === 'sound'
																								? state === 'off'
																									? 'music-note-off'
																									: 'music-note'
																								: stateObj?.attributes.device_class === 'update'
																									? state === 'off'
																										? 'package'
																										: 'package-up'
																									: stateObj?.attributes.device_class ===
																										  'vibration'
																										? state === 'off'
																											? 'crop-portrait'
																											: 'vibrate'
																										: stateObj?.attributes.device_class === 'window'
																											? state === 'off'
																												? 'window-closed'
																												: 'window-open'
																											: state === 'off'
																												? 'radiobox-blank'
																												: 'checkbox-marked-circle',
		button:
			stateObj?.attributes.device_class === 'restart'
				? 'restart'
				: stateObj?.attributes.device_class === 'update'
					? 'package-up'
					: 'gesture-tap-button',
		camera: state === 'off' ? 'video-off' : 'video',
		cover:
			stateObj?.attributes.device_class === 'garage'
				? state === 'opening'
					? 'arrow-up-box'
					: state === 'closing'
						? 'arrow-down-box'
						: state === 'closed'
							? 'garage'
							: 'garage-open'
				: stateObj?.attributes.device_class === 'gate'
					? state === 'opening' || state === 'closing'
						? 'gate-arrow-right'
						: state === 'closed'
							? 'gate'
							: 'gate-open'
					: stateObj?.attributes.device_class === 'door'
						? state !== 'closed'
							? 'door-open'
							: 'door-closed'
						: stateObj?.attributes.device_class === 'damper'
							? state !== 'closed'
								? 'circle'
								: 'circle-slice-8'
							: stateObj?.attributes.device_class === 'shutter'
								? state === 'opening'
									? 'arrow-up-box'
									: state === 'closing'
										? 'arrow-down-box'
										: state === 'closed'
											? 'window-shutter'
											: 'window-shutter-open'
								: stateObj?.attributes.device_class === 'curtain'
									? state === 'opening'
										? 'arrow-split-vertical'
										: state === 'closing'
											? 'arrow-collapse-horizontal'
											: state === 'closed'
												? 'curtains-closed'
												: 'curtains'
									: stateObj?.attributes.device_class === 'blind'
										? state === 'opening'
											? 'arrow-up-box'
											: state === 'closing'
												? 'arrow-down-box'
												: state === 'closed'
													? 'blinds-horizontal-closed'
													: 'blinds-horizontal'
										: stateObj?.attributes.device_class === 'shade'
											? state === 'opening'
												? 'arrow-up-box'
												: state === 'closing'
													? 'arrow-down-box'
													: state === 'closed'
														? 'roller-shade-closed'
														: 'roller-shade'
											: stateObj?.attributes.device_class === 'window'
												? state === 'opening'
													? 'arrow-up-box'
													: state === 'closing'
														? 'arrow-down-box'
														: state === 'closed'
															? 'window-closed'
															: 'window-open'
												: ['awning', 'door', 'gate', 'curtain'].includes(
															stateObj?.attributes.device_class
													  )
													? state === 'opening'
														? 'arrow-expand-horizontal'
														: 'arrow-down'
													: state === 'opening'
														? 'arrow-up-box'
														: state === 'closing'
															? 'arrow-down-box'
															: state === 'closed'
																? 'window-closed'
																: 'window-open',
		device_tracker:
			stateObj?.attributes.source_type === 'router'
				? state === 'home'
					? 'lan-connect'
					: 'lan-disconnect'
				: ['bluetooth', 'bluetooth_le'].includes(stateObj?.attributes.source_type)
					? state === 'home'
						? 'bluetooth-connect'
						: 'bluetooth'
					: state === 'not_home'
						? 'account-arrow-right'
						: 'account',
		event:
			stateObj?.attributes.device_class === 'doorbell'
				? 'doorbell'
				: stateObj?.attributes.device_class === 'button'
					? 'gesture-tap-button'
					: stateObj?.attributes.device_class === 'motion'
						? 'motion-sensor'
						: 'eye-check',
		fan: state === 'off' ? 'fan-off' : 'fan',
		humidifier: state === 'off' ? 'air-humidifier-off' : 'air-humidifier',
		input_boolean: state === 'on' ? 'check-circle-outline' : 'close-circle-outline',
		input_datetime: !stateObj?.attributes.has_date
			? 'clock'
			: !stateObj.attributes.has_time
				? 'calendar'
				: 'calendar-clock',
		lock:
			state === 'unlocked'
				? 'lock-open'
				: state === 'jammed'
					? 'lock-alert'
					: state === 'locking' || state === 'unlocking'
						? 'lock-clock'
						: 'lock',
		media_player:
			stateObj?.attributes.device_class === 'speaker'
				? state === 'playing'
					? 'speaker-play'
					: state === 'paused'
						? 'speaker-pause'
						: state === 'off'
							? 'speaker-off'
							: 'speaker'
				: stateObj?.attributes.device_class === 'tv'
					? state === 'playing'
						? 'television-play'
						: state === 'paused'
							? 'television-pause'
							: state === 'off'
								? 'television-off'
								: 'television'
					: stateObj?.attributes.device_class === 'receiver'
						? state === 'off'
							? 'audio-video-off'
							: 'audio-video'
						: state === 'playing' || state === 'paused'
							? 'cast-connected'
							: state === 'off'
								? 'cast-off'
								: 'cast',
		number:
			stateObj?.attributes.device_class &&
			stateObj.attributes.device_class in FIXED_DEVICE_CLASS_ICONS
				? FIXED_DEVICE_CLASS_ICONS[stateObj.attributes.device_class]
				: 'ray-vertex',
		person: state === 'not_home' ? 'account-arrow-right' : 'account',
		switch:
			stateObj?.attributes.device_class === 'outlet'
				? state === 'on'
					? 'power-plug'
					: 'power-plug-off'
				: stateObj?.attributes.device_class === 'switch'
					? state === 'on'
						? 'toggle-switch-variant'
						: 'toggle-switch-variant-off'
					: 'toggle-switch-variant',
		valve:
			stateObj?.attributes.device_class && stateObj?.attributes.device_class === 'gas'
				? 'meter-gas'
				: 'pipe-valve',
		sensor:
			stateObj?.attributes.device_class &&
			stateObj?.attributes.device_class in FIXED_DEVICE_CLASS_ICONS
				? FIXED_DEVICE_CLASS_ICONS[stateObj?.attributes.device_class]
				: stateObj?.attributes.device_class === 'battery'
					? isNaN(Number(state))
						? state === 'off'
							? 'battery'
							: state === 'on'
								? 'battery-alert'
								: 'battery-unknown'
						: state === 'on'
							? Number(state) >= 10
								? BATTERY_CHARGING_ICONS[Math.round(Number(state) / 10) * 10]
								: 'battery-charging-outline'
							: Number(state) <= 5
								? 'battery-alert-variant-outline'
								: BATTERY_ICONS[Math.round(Number(state) / 10) * 10]
					: stateObj?.attributes.unit_of_measurement === '°C' ||
						  stateObj?.attributes.unit_of_measurement === '°F'
						? 'thermometer'
						: 'eye',
		sun: state === 'above_horizon' ? 'white-balance-sunny' : 'weather-night',
		water_heater: state === 'off' ? 'water-boiler-off' : 'water-boiler'
	};

	const WEATHER_ICONS: any = {
		'clear-night': 'weather-night',
		cloudy: 'weather-cloudy',
		exceptional: 'alert-circle-outline',
		fog: 'weather-fog',
		hail: 'weather-hail',
		lightning: 'weather-lightning',
		'lightning-rainy': 'weather-lightning-rainy',
		partlycloudy: 'weather-partly-cloudy',
		pouring: 'weather-pouring',
		rainy: 'weather-rainy',
		snowy: 'weather-snowy',
		'snowy-rainy': 'weather-snowy-rainy',
		sunny: 'weather-sunny',
		windy: 'weather-windy',
		'windy-variant': 'weather-windy-variant'
	};

	function dispatchIconString() {
		if (!getIconString) return;

		const icon = currentIcon
			? currentIcon === 'entity_picture'
				? $states?.[entity_id]?.attributes?.entity_picture
				: currentIcon
			: undefined;

		dispatch('iconString', icon);
	}

	function loadEntityPicture(entity_picture: string) {
		const img = new Image();
		img.onload = () => (src = entity_picture);
		img.onerror = () => (src = undefined);
		img.src = entity_picture;
	}

	onMount(() => {
		dispatchIconString();

		if (currentIcon === 'entity_picture') {
			loadEntityPicture(stateObj?.attributes?.entity_picture);
		}
	});

	function getCurrentIcon() {
		const entity = $states[entity_id];
		const domain = getDomain(entity?.entity_id || entity_id);

		if (entity?.attributes?.entity_picture && !skipEntitiyPicture && domain !== 'update') {
			return 'entity_picture';
		} else if (entity?.attributes?.icon && String(entity.attributes.icon).startsWith('mdi')) {
			return entity.attributes.icon.toString();
		} else if (domain === 'weather' && entity?.state) {
			return 'mdi:' + WEATHER_ICONS[entity.state];
		} else if (domain) {
			const defaultIcon = (ICONS as Record<string, string>)[domain];
			if (defaultIcon) {
				return 'mdi:' + defaultIcon;
			} else if (!entity) {
				// it's a service with no icon
				return 'mdi:room-service';
			}
		}
		dispatchIconString();
	}

	$: if ($states && entity_id) {
		currentIcon = getCurrentIcon();
	}
</script>

{#if currentIcon === 'entity_picture'}
	<!--  entity_picture  -->

	{#if src}
		<img {src} alt="" />
	{:else}
		<Icon icon="ph:image-broken-duotone" height="auto" width="100%" />
	{/if}
{:else if currentIcon}
	<!--  icon  -->

	<Icon icon={currentIcon} style="font-size: {size || '2rem'}" />
{:else if entity_id && stateObj}
	<!-- {(console.warn('icon missing ', entity_id, stateObj), '')} -->
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		object-position: center;
	}
</style>
