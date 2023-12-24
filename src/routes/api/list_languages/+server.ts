import { readdir } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import path from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
	try {
		const dir = dev ? './static/translations' : './build/client/translations';
		const files = await readdir(dir);
		const languages = files
			.filter((file) => path.extname(file) === '.json')
			.map((file) => file.split('.')[0]);

		setHeaders({ 'Cache-Control': 'max-age=0' });

		return json(languages);
	} catch (err: any) {
		error(500, err.message);
	}
};
