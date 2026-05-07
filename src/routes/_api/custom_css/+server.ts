import { readFile, writeFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PATH = './data/custom_style.css';
const DEFAULT = '/* Custom CSS */\n';

export const GET: RequestHandler = async ({ setHeaders }) => {
	let file;

	try {
		file = await readFile(PATH, 'utf-8');
	} catch (err: any) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			await writeFile(PATH, DEFAULT, 'utf-8');
			file = DEFAULT;
		} else {
			error(500, err.message);
		}
	}

	setHeaders({ 'Cache-Control': 'max-age=0' });

	return json(file);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { content } = await request.json();
		await writeFile(PATH, content ?? '', 'utf-8');
		return json({ action: 'saved' });
	} catch (err: any) {
		error(500, err.message);
	}
};
