import { readFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, setHeaders }) => {
	try {
		const body = await request.json();

		if (!body.locale || typeof body.locale !== 'string') {
			throw new Error('Invalid locale');
		}

		const dir = dev ? './static/translations' : './build/client/translations';

		const [en, locale] = await Promise.all([
			readFile(`${dir}/en.json`, 'utf8'),
			body.locale && body.locale !== 'en'
				? readFile(`${dir}/${body.locale}.json`, 'utf8')
				: undefined
		]);

		const translations = locale
			? { ...JSON.parse(locale), _default: JSON.parse(en) }
			: JSON.parse(en);

		setHeaders({ 'Cache-Control': 'max-age=0' });

		return json(translations);
	} catch (err: any) {
		error(500, err.message);
	}
};
