import { readdir, readFile } from 'fs/promises';
import { dev } from '$app/environment';
import { json, error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import path from 'path';
import type { RequestHandler } from './$types';

interface ThemeData {
	title: string;
	author: string;
	attribution: string;
	theme: object;
}

export const GET: RequestHandler = async ({ setHeaders }) => {
	try {
		const dir = dev ? './static/themes' : './build/client/themes';
		const files = await readdir(dir);
		const yamlFiles = files.filter((file) => file.endsWith('.yaml'));

		const themes = await Promise.all(
			yamlFiles.map(async (file) => {
				const filePath = `${dir}/${file}`;
				const data = await readFile(filePath, 'utf-8');
				const themeData = yaml.load(data) as ThemeData;

				if (path.parse(file).name !== themeData?.title) {
					return null;
				}

				return {
					file: file,
					title: themeData?.title,
					author: themeData?.author,
					attribution: themeData?.attribution,
					theme: themeData?.theme
				};
			})
		);

		const validate = themes.filter(Boolean);

		setHeaders({ 'Cache-Control': 'max-age=0' });

		return json(validate);
	} catch (err: any) {
		error(500, err.message);
	}
};
