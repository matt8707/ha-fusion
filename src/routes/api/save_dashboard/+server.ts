import { writeFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	let data;

	try {
		data = yaml.dump(body);
	} catch (err: any) {
		error(500, err.message);
	}

	try {
		await writeFile('./data/dashboard.yaml', data);
		return json({ message: 'saved' });
	} catch (err: any) {
		error(500, err.message);
	}
};
