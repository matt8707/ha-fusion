import { readFile, writeFile } from 'fs/promises';
import { dev } from '$app/environment';
import yaml from 'js-yaml';
import type { Configuration, Dashboard, Translations } from '$lib/Types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Loads a yaml/json file and returns parsed data
 */
async function loadFile(file: string) {
	try {
		const data = await readFile(file, 'utf8');
		if (!data.trim()) {
			return {}; // file is empty, early return object
		} else {
			return file.endsWith('.yaml') ? yaml.load(data) : JSON.parse(data);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
			// console.error(`No existing file found for ${file}`);
		} else {
			console.error(`Error reading or parsing ${file}:`, error);
		}
		return {};
	}
}

/**
 * Server load function
 */
export async function load({ request }): Promise<{
	configuration: Configuration;
	dashboard: Dashboard;
	theme: any;
	translations: Translations;
}> {
	// must be loaded first
	const [configuration, dashboard] = await Promise.all([
		loadFile('./data/configuration.yaml'),
		loadFile('./data/dashboard.yaml')
	]);

	// determine hassUrl
	let hassUrl = process.env.ADDON ? configuration.hassUrl : process.env.HASS_URL;

	if (!hassUrl) {
		const proto = request.headers.get('x-forwarded-proto');
		const host = request.headers.get('x-forwarded-host');
		if (proto && host) hassUrl = `${proto}://${host}`;
	}

	// update hassUrl
	if (hassUrl && hassUrl !== configuration.hassUrl) {
		configuration.hassUrl = hassUrl;
		try {
			await writeFile('./data/configuration.yaml', yaml.dump(configuration), 'utf8');
		} catch (error) {
			console.error('error updating configuration.yaml:', error);
		}
	}

	// initialize keys if missing
	dashboard.views = dashboard.views || [];
	dashboard.sidebar = dashboard.sidebar || [];

	const dir = dev ? './static' : './build/client';

	// load theme and locale
	const [theme, en, locale] = await Promise.all([
		loadFile(`${dir}/themes/${dashboard.theme || 'godis'}.yaml`),
		loadFile(`${dir}/translations/en.json`),
		configuration?.locale && configuration.locale !== 'en'
			? loadFile(`${dir}/translations/${configuration.locale}.json`)
			: undefined
	]);

	return {
		configuration,
		dashboard,
		theme,
		translations: locale ? { ...locale, _default: en } : en
	};
}
