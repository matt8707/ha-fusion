import {
	Auth,
	createConnection,
	subscribeConfig,
	subscribeEntities,
	ERR_CANNOT_CONNECT,
	ERR_INVALID_AUTH,
	ERR_CONNECTION_LOST,
	ERR_HASS_HOST_REQUIRED,
	ERR_INVALID_HTTPS_TO_HTTP
} from 'home-assistant-js-websocket';
import { states, connection, config, connected } from '$lib/Stores';
import { openModal } from 'svelte-modals';

export async function authenticate() {
	const storage = localStorage.getItem('hassTokens');
	const data = storage ? JSON.parse(storage) : null;

	if (data?.access_token) {
		// connect
		const auth = new Auth(data);
		await webSocket(auth);
	} else {
		// login modal
		openModal(async () => import('$lib/Modal/LoginModal.svelte'));
	}
}

export async function webSocket(auth: Auth) {
	try {
		// connection
		const conn = await createConnection({ auth });
		connection.set(conn);

		// states
		subscribeEntities(conn, (hassEntities) => {
			states.set(hassEntities);
		});

		// config
		subscribeConfig(conn, (hassConfig) => {
			config.set(hassConfig);
		});

		// events
		conn.addEventListener('ready', () => {
			console.debug('connected.');
			connected.set(true);
		});

		conn.addEventListener('disconnected', () => {
			console.debug('connecting...');
			connected.set(false);
		});

		conn.addEventListener('reconnect-error', () => {
			console.error('ERR_INVALID_AUTH.');
			connected.set(false);
		});
	} catch (error) {
		switch (error) {
			case ERR_INVALID_AUTH:
				console.error('ERR_INVALID_AUTH');

				// data is invalid
				localStorage.removeItem('hassTokens');
				location.reload();
				break;

			case ERR_CANNOT_CONNECT:
				console.error('ERR_CANNOT_CONNECT');
				break;

			case ERR_CONNECTION_LOST:
				console.error('ERR_CONNECTION_LOST');
				break;

			case ERR_HASS_HOST_REQUIRED:
				console.error('ERR_HASS_HOST_REQUIRED');
				break;

			case ERR_INVALID_HTTPS_TO_HTTP:
				console.error('ERR_INVALID_HTTPS_TO_HTTP');
				break;

			default:
				console.error(error);
		}
		throw error;
	}
}
