import { readable } from 'svelte/store';

// A set of icons, e.g. meteocons, weather icons
export interface WeatherIconSet {
	type: string;
	conditions: WeatherIconConditions;
}

// Conditions as defined in <https://www.home-assistant.io/integrations/weather/#condition-mapping>
export interface WeatherIconConditions {
	'clear-night': WeatherIconMapping;
	cloudy: WeatherIconMapping;
	fog: WeatherIconMapping;
	hail: WeatherIconMapping;
	lightning: WeatherIconMapping;
	'lightning-rainy': WeatherIconMapping;
	partlycloudy: WeatherIconMapping;
	pouring: WeatherIconMapping;
	rainy: WeatherIconMapping;
	snowy: WeatherIconMapping;
	'snowy-rainy': WeatherIconMapping;
	sunny: WeatherIconMapping;
	windy: WeatherIconMapping;
	'windy-variant': WeatherIconMapping;
	exceptional: WeatherIconMapping;
}

// Icon variants for day & night. Icons which are either-or should be the same icon (clear-night, sunny, potentially others depending on the library)
export interface WeatherIconMapping {
	local?: boolean;
	icon_variant_day: string;
	icon_variant_night: string;
}

export const iconMapMaterialSymbolsLight: WeatherIconSet = {
	type: 'materialsymbolslight',
	conditions: {
		'clear-night': {
			icon_variant_day: 'material-symbols-light:bedtime-outline-rounded',
			icon_variant_night: 'material-symbols-light:bedtime-outline-rounded'
		},
		cloudy: {
			icon_variant_day: 'material-symbols-light:cloud-outline',
			icon_variant_night: 'material-symbols-light:cloud-outline'
		},
		exceptional: {
			icon_variant_day: 'material-symbols-light:warning-outline-rounded',
			icon_variant_night: 'material-symbols-light:warning-outline-rounded'
		},
		fog: {
			icon_variant_day: 'material-symbols-light:foggy-outline',
			icon_variant_night: 'material-symbols-light:foggy-outline'
		},
		hail: {
			icon_variant_day: 'material-symbols-light:weather-hail-outline-rounded',
			icon_variant_night: 'material-symbols-light:weather-hail-outline-rounded'
		},
		lightning: {
			icon_variant_day: 'material-symbols-light:thunderstorm-outline-rounded',
			icon_variant_night: 'material-symbols-light:thunderstorm-outline-rounded'
		},
		'lightning-rainy': {
			icon_variant_day: 'material-symbols-light:thunderstorm-outline-rounded',
			icon_variant_night: 'material-symbols-light:thunderstorm-outline-rounded'
		},
		partlycloudy: {
			icon_variant_day: 'material-symbols-light:partly-cloudy-day-outline',
			icon_variant_night: 'material-symbols-light:nights-stay-outline-rounded'
		},
		pouring: {
			icon_variant_day: 'material-symbols-light:rainy-outline',
			icon_variant_night: 'material-symbols-light:rainy-outline'
		},
		rainy: {
			icon_variant_day: 'material-symbols-light:rainy-outline',
			icon_variant_night: 'material-symbols-light:rainy-outline'
		},
		snowy: {
			icon_variant_day: 'material-symbols-light:cloudy-snowing-outline',
			icon_variant_night: 'material-symbols-light:cloudy-snowing-outline'
		},
		'snowy-rainy': {
			icon_variant_day: 'material-symbols-light:weather-mix-outline-rounded',
			icon_variant_night: 'material-symbols-light:weather-mix-outline-rounded'
		},
		sunny: {
			icon_variant_day: 'material-symbols-light:sunny-outline-rounded',
			icon_variant_night: 'material-symbols-light:sunny-outline-rounded'
		},
		windy: {
			icon_variant_day: 'material-symbols-light:mist',
			icon_variant_night: 'material-symbols-light:mist'
		},
		'windy-variant': {
			icon_variant_day: 'material-symbols-light:mistd',
			icon_variant_night: 'material-symbols-light:mist'
		}
	}
};

export const iconMapMeteocons: WeatherIconSet = {
	type: 'meteocons',
	conditions: {
		'clear-night': {
			local: true,
			icon_variant_day: 'weather/meteocons/clear-night-day',
			icon_variant_night: 'weather/meteocons/clear-night-night'
		},
		cloudy: {
			local: true,
			icon_variant_day: 'weather/meteocons/cloudy-day',
			icon_variant_night: 'weather/meteocons/cloudy-night'
		},
		exceptional: {
			local: true,
			icon_variant_day: 'weather/meteocons/exceptional-day',
			icon_variant_night: 'weather/meteocons/exceptional-night'
		},
		fog: {
			local: true,
			icon_variant_day: 'weather/meteocons/fog-day',
			icon_variant_night: 'weather/meteocons/fog-night'
		},
		hail: {
			local: true,
			icon_variant_day: 'weather/meteocons/hail-day',
			icon_variant_night: 'weather/meteocons/hail-night'
		},
		lightning: {
			local: true,
			icon_variant_day: 'weather/meteocons/lightning-day',
			icon_variant_night: 'weather/meteocons/lightning-night'
		},
		'lightning-rainy': {
			local: true,
			icon_variant_day: 'weather/meteocons/lightning-rainy-day',
			icon_variant_night: 'weather/meteocons/lightning-rainy-night'
		},
		partlycloudy: {
			local: true,
			icon_variant_day: 'weather/meteocons/partlycloudy-day',
			icon_variant_night: 'weather/meteocons/partlycloudy-night'
		},
		pouring: {
			local: true,
			icon_variant_day: 'weather/meteocons/pouring-day',
			icon_variant_night: 'weather/meteocons/pouring-night'
		},
		rainy: {
			local: true,
			icon_variant_day: 'weather/meteocons/rainy-day',
			icon_variant_night: 'weather/meteocons/rainy-night'
		},
		snowy: {
			local: true,
			icon_variant_day: 'weather/meteocons/snowy-day',
			icon_variant_night: 'weather/meteocons/snowy-night'
		},
		'snowy-rainy': {
			local: true,
			icon_variant_day: 'weather/meteocons/snowy-rainy-day',
			icon_variant_night: 'weather/meteocons/snowy-rainy-night'
		},
		sunny: {
			local: true,
			icon_variant_day: 'weather/meteocons/sunny-day',
			icon_variant_night: 'weather/meteocons/sunny-night'
		},
		windy: {
			local: true,
			icon_variant_day: 'weather/meteocons/windy-day',
			icon_variant_night: 'weather/meteocons/windy-night'
		},
		'windy-variant': {
			local: true,
			icon_variant_day: 'weather/meteocons/windy-variant-day',
			icon_variant_night: 'weather/meteocons/windy-variant-night'
		}
	}
};

export const iconMapWeatherIcons: WeatherIconSet = {
	type: 'weathericons',
	conditions: {
		'clear-night': {
			icon_variant_day: 'wi:night-clear',
			icon_variant_night: 'wi:night-clear'
		},
		cloudy: {
			icon_variant_day: 'wi:day-cloudy',
			icon_variant_night: 'wi:night-alt-cloudy'
		},
		exceptional: {
			icon_variant_day: 'wi:na',
			icon_variant_night: 'wi:na'
		},
		fog: {
			icon_variant_day: 'wi:day-fog',
			icon_variant_night: 'wi:night-fog'
		},
		hail: {
			icon_variant_day: 'wi:day-hail',
			icon_variant_night: 'wi:night-alt-hail'
		},
		lightning: {
			icon_variant_day: 'wi:day-lightning',
			icon_variant_night: 'wi:night-alt-lightning'
		},
		'lightning-rainy': {
			icon_variant_day: 'wi:day-thunderstorm',
			icon_variant_night: 'wi:night-alt-thunderstorm'
		},
		partlycloudy: {
			icon_variant_day: 'wi:day-cloudy',
			icon_variant_night: 'wi:night-alt-cloudy'
		},
		pouring: {
			icon_variant_day: 'wi:day-rain',
			icon_variant_night: 'wi:night-alt-rain'
		},
		rainy: {
			icon_variant_day: 'wi:day-rain',
			icon_variant_night: 'wi:night-alt-rain'
		},
		snowy: {
			icon_variant_day: 'wi:day-snow',
			icon_variant_night: 'wi:night-alt-snow'
		},
		'snowy-rainy': {
			icon_variant_day: 'wi:day-sleet',
			icon_variant_night: 'wi:night-alt-sleet'
		},
		sunny: {
			icon_variant_day: 'wi:day-sunny',
			icon_variant_night: 'wi:day-sunny'
		},
		windy: {
			icon_variant_day: 'wi:strong-wind',
			icon_variant_night: 'wi:strong-wind'
		},
		'windy-variant': {
			icon_variant_day: 'wi:strong-wind',
			icon_variant_night: 'wi:strong-wind'
		}
	}
};

// Weather icon mapping
export const iconMap = readable<Record<string, WeatherIconSet>>({
	materialsymbolslight: iconMapMaterialSymbolsLight,
	meteocons: iconMapMeteocons,
	weathericons: iconMapWeatherIcons
});
