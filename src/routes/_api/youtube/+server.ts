import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { Innertube, UniversalCache } from 'youtubei.js';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import yaml from 'js-yaml';

interface Event {
	message?: string;
	error?: string;
	data?: any;
	verification_url?: string;
	user_code?: string;
}

let youtube: Innertube | undefined;

/**
 * GET: Streams server-sent events to client in add-on settings.
 */
export const GET: RequestHandler = async () => {
	const headers = {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive'
	};

	const stream = new ReadableStream({ start: streamEvents });
	return new Response(stream, { headers });
};

/**
 * Handles YouTube authentication and retrieves user info.
 */
async function streamEvents(controller: ReadableStreamDefaultController) {
	const send = (event: Event) => {
		controller?.enqueue(`data: ${JSON.stringify(event)}\n\n`);
	};

	try {
		send({ message: 'Loading...' });

		youtube = await Innertube.create({
			cache: new UniversalCache(false)
		});

		youtube.session.on('auth-pending', (data) => {
			send({
				verification_url: data.verification_url,
				user_code: data.user_code
			});
		});

		youtube.session.on('auth', async ({ credentials }) => {
			await saveAuth(credentials);
		});

		youtube.session.on('update-credentials', async ({ credentials }) => {
			await saveAuth(credentials);
		});

		youtube.session.on('auth-error', (error) => {
			try {
				send({ error: JSON.stringify(error) });
			} catch (err) {
				console.error(err);
			}
		});

		const auth = await loadAuth();
		await youtube.session.signIn(auth);

		const info = await youtube.account.getInfo();
		send({ data: info });
		controller?.close?.();
	} catch (err) {
		send({ error: 'Failed to initialize YouTube session' });
		controller?.close?.();
	}
}

/**
 * Load credentials.
 */
async function loadAuth() {
	try {
		const data = readFileSync('./data/youtube_credentials.json', 'utf8');
		return JSON.parse(data);
	} catch (err) {
		// console.error('Failed to load credentials:', err);
	}
}

/**
 * Save credentials.
 */
async function saveAuth(credentials: any) {
	try {
		const data = JSON.stringify(credentials, null, '\t') + '\n';
		writeFileSync('./data/youtube_credentials.json', data);
	} catch (err) {
		console.error('Failed to save credentials:', err);
	}
}

/**
 * Check if a high-resolution YouTube thumbnail is available.
 */
async function getThumbnail(id: string) {
	const url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

	// only get headers
	const response = await fetch(url, { method: 'HEAD' });

	if (response.ok) return url;
}

/**
 * POST either `sign-out` or `get-history`
 */
export const POST = async ({ request }) => {
	const response = await request.json();

	// sign-out
	if (response.action === 'sign-out') {
		try {
			if (youtube) {
				await youtube.session.signOut();
				unlinkSync('./data/youtube_credentials.json');

				let config = await loadFile('./data/configuration.yaml');

				if (config?.addons && config?.addons?.youtube) {
					delete config.addons.youtube;

					try {
						config = yaml.dump(config);
					} catch (err) {
						console.log(err);
					}

					try {
						writeFileSync('./data/configuration.yaml', config);
					} catch (err) {
						console.log(err);
					}
				}

				return new Response('Signed out successfully', { status: 200 });
			} else {
				return new Response('No active session', { status: 400 });
			}
		} catch (err) {
			return error(500, { message: 'Failed to sign out' });
		}

		// get-history
	} else if (response.action === 'get-history') {
		try {
			youtube = await Innertube.create({
				cache: new UniversalCache(false)
			});

			const eventSignal = new Promise<void>((resolve) => {
				if (!youtube) return;

				youtube.session.on('auth-pending', () => {
					console.error(
						'YouTube credentials have expired, please sign in again or turn off add-on.'
					);
					resolve();
				});

				youtube.session.on('auth', ({ credentials }) => {
					saveAuth(credentials);
					resolve();
				});

				youtube.session.on('update-credentials', ({ credentials }) => {
					saveAuth(credentials);
					resolve();
				});

				youtube.session.on('auth-error', (error) => {
					console.error('YouTube add-on:', error);
					resolve();
				});
			});

			const auth = await loadAuth();

			await youtube.session.signIn(auth);

			await eventSignal;

			const library = await youtube.getLibrary();

			const history = library?.sections?.find((section: any) => section?.title?.text === 'History');

			const video = history?.contents.find((video) => {
				return (
					video.author?.name === response?.media_artist &&
					video.title?.text === response?.media_title
				);
			});

			const { author, title, id, thumbnails } = video;
			const maxres = await getThumbnail(id);

			return json({
				media_artist: author?.name,
				media_title: title?.text,
				entity_picture: maxres || thumbnails?.[0]?.url
			});
		} catch (err: any) {
			error(503, { message: err.message });
		}
	}
};

/**
 * Loads a yaml/json file and returns parsed data
 */
async function loadFile(file: string) {
	try {
		const data = readFileSync(file, 'utf8');
		if (!data.trim()) {
			return {}; // file is empty, early return object
		} else {
			return file.endsWith('.yaml') ? yaml.load(data) : JSON.parse(data);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
			// console.error(`No existing file found for ${file}`);
		} else {
			console.error(`Error reading or parsing ${file}:`, error);
		}
		return {};
	}
}
