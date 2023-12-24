import { readFile, writeFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Reads the contents of '/data/custom_javascript.js'.
 * If the file doesn't exist, creates it with default content.
 */
export const GET: RequestHandler = async ({ setHeaders }) => {
	let file;
	const path = './data/custom_javascript.js';

	try {
		file = await readFile(path, 'utf-8');
	} catch (err: any) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			console.warn(`File not found... creating ${path}`);
			const content = `console.debug('🎉 Custom JavaScript file loaded!');\n`;
			await writeFile(path, `console.debug('🎉 Custom JavaScript file loaded!');\n`, 'utf-8');
			file = content;
		} else {
			error(500, err.message);
		}
	}

	setHeaders({ 'Cache-Control': 'max-age=0' });

	return json(file);
};
