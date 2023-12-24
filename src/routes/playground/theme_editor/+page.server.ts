import { readFile } from 'fs/promises';
import { dev } from '$app/environment';
import yaml from 'js-yaml';

async function loadFile(file: string) {
	try {
		const data = await readFile(file, 'utf8');
		return yaml.load(data);
	} catch (error) {
		console.error(`Error reading or parsing ${file}:`, error);
		return {};
	}
}

export async function load() {
	const theme = await loadFile(
		`${dev ? 'static' : 'build/client'}/themes/playground/category.yaml`
	);

	return {
		theme
	};
}
