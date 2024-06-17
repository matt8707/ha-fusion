import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { Innertube, UniversalCache } from 'youtubei.js';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import type { YouTubeEvent } from '$lib/Types';
import yaml from 'js-yaml';

let youtube: Innertube | undefined;
let event: YouTubeEvent | undefined;

const credentialsFilePath = './data/youtube_credentials.json';

/**
 * Handle post requests
 * poll, logout, history
 */
export const POST: RequestHandler = async ({ request }) => {
	const response = await request.json();
	const message = response?.message;

	if (message === 'poll') {
		// poll
		return json(event || {});

		// logout
	} else if (message === 'logout') {
		try {
			// catch error if not signed in
			// so credentials can be removed anyway
			try {
				await youtube?.session.signOut();
			} catch (err) {
				console.error(err);
			}
			unlinkSync(credentialsFilePath);
			const configFilePath = './data/configuration.yaml';
			let config = await loadFile(configFilePath);

			if (config?.addons?.youtube) {
				delete config.addons.youtube;
				config = yaml.dump(config);
				writeFileSync(configFilePath, config);
			}

			return json({
				message: 'success'
			});
		} catch (err: any) {
			return error(500, err?.message);
		}

		// history
	} else if (message === 'history') {
		try {
			youtube = await Innertube.create({
				cache: new UniversalCache(false)
			});

			const events = new Promise<void>((resolve) => {
				if (!youtube) return;

				youtube.session.on('auth-pending', () => {
					console.error(
						'YouTube credentials have expired, please sign in again or turn off add-on.'
					);
					resolve();
				});

				youtube.session.on('auth', async ({ credentials }) => {
					await saveFile(credentials);
					resolve();
				});

				youtube.session.on('update-credentials', async ({ credentials }) => {
					await saveFile(credentials);
					resolve();
				});

				youtube.session.on('auth-error', (error) => {
					console.error('YouTube add-on:', error);
					resolve();
				});
			});

			const auth = await loadFile(credentialsFilePath);
			await youtube.session.signIn(auth);
			await events;

			const library = await youtube.getLibrary();
			const history = library?.sections?.find((section: any) => section?.title?.text === 'History');
			const video = history?.contents.find((video) => {
				return (
					video.author?.name === response?.media_artist &&
					video.title?.text === response?.media_title
				);
			});

			const { author, title, id, thumbnails } = video;

			const getThumbnail = async (id: string) => {
				const url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
				const response = await fetch(url, { method: 'HEAD' });
				if (response.ok) return url;
			};

			const maxres = await getThumbnail(id);

			return json({
				media_artist: author?.name,
				media_title: title?.text,
				entity_picture: maxres || thumbnails?.[0]?.url
			});
		} catch (err: any) {
			error(500, err?.message);
		}
	}

	return json({
		message: 'error',
		error: 'Unhandled post request'
	});
};

/**
 * Init auth and return `AccountInfo`.
 */
export const GET: RequestHandler = async () => {
	try {
		youtube = await Innertube.create({
			cache: new UniversalCache(false)
		});

		youtube.session.on('auth-pending', (data) => {
			event = {
				message: 'auth-pending',
				verification_url: data?.verification_url,
				user_code: data?.user_code,
				timestamp: new Date().getTime()
			};
		});

		youtube.session.on('auth', async ({ credentials }) => {
			event = { message: 'auth' };
			await saveFile(credentials);
		});

		youtube.session.on('update-credentials', async ({ credentials }) => {
			event = { message: 'update-credentials' };
			await saveFile(credentials);
		});

		youtube.session.on('auth-error', (error) => {
			event = {
				message: 'auth-error',
				error: error
			};
		});

		let auth = await loadFile(credentialsFilePath);

		// load function returned empty object
		// signIn expects undefined if empty
		if (!Object.keys(auth)?.length) auth = undefined;

		await youtube.session.signIn(auth);

		const data = await youtube.account.getInfo();
		event = undefined;
		return json(data);

		// error
	} catch (err: any) {
		console.error(err);
		return error(500, err.message);
	}
};

/**
 * Load file.
 */
async function loadFile(filePath: string) {
	try {
		const data = readFileSync(filePath, 'utf8');

		if (!data.trim()) {
			// file is empty, early return object
			return {};
		} else {
			return filePath.endsWith('.yaml') ? yaml.load(data) : JSON.parse(data);
		}
	} catch (err) {
		if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
			// console.error(`No existing file found for ${file}`);
		} else {
			console.error(`Error reading or parsing ${filePath}:`, err);
		}
		return {};
	}
}

/**
 * Save file.
 */
async function saveFile(credentials: any) {
	try {
		const data = JSON.stringify(credentials, null, '\t') + '\n';
		writeFileSync(credentialsFilePath, data);
	} catch (err) {
		console.error('Failed to save credentials:', err);
	}
}
