import { readFile, writeFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// load
export const GET: RequestHandler = async () => {
	try {
		const [packageFile, versionFile] = await Promise.all([
			readFile('./package.json', 'utf8'),
			readFile('./data/version.json', 'utf8')
		]);

		const packageData = JSON.parse(packageFile);
		const versionData = JSON.parse(versionFile);

		return json({
			installed: packageData?.version,
			latest: versionData?.latest,
			last_updated: versionData?.last_updated
		});
	} catch (err: any) {
		error(500, err);
	}
};

// save
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const data = JSON.stringify(body, null, '\t') + '\n';
		await writeFile('./data/version.json', data);
		return json({ message: 'success' });
	} catch (err: any) {
		return error(500, err);
	}
};
