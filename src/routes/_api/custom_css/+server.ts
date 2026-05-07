import { readFile, writeFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
	let file;
	const path = './data/custom_style.css';

	try {
		file = await readFile(path, 'utf-8');
	} catch (err: any) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			console.warn(`File not found... creating ${path}`);
			const content = `/* 🎨 Custom CSS file loaded! */\n`;
			await writeFile(path, content, 'utf-8');
			file = content;
		} else {
			error(500, err.message);
		}
	}

	setHeaders({ 'Cache-Control': 'max-age=0' });

	return json(file);
};
