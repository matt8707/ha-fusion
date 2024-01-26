/**
 * Remove large sveltekit `link` header to be able to run behind reverse proxy
 * `upstream sent too big header while reading esponse header from upstream`
 *
 * and set html lang attribute
 */

import { readFile } from 'fs/promises';
import yaml from 'js-yaml';

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

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {

	const [configuration] = await Promise.all([
		loadFile('./data/configuration.yaml')
	]);

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', configuration?.locale || 'en')
	});

	response.headers.delete('link');
	return response;
}
