import {
	Auth,
	createConnection,
	subscribeConfig,
	subscribeEntities,
	ERR_CANNOT_CONNECT,
	ERR_INVALID_AUTH,
	ERR_CONNECTION_LOST,
	ERR_HASS_HOST_REQUIRED,
	ERR_INVALID_HTTPS_TO_HTTP,
	genClientId
} from 'home-assistant-js-websocket';
import { states, connection, config, connected } from '$lib/Stores';
import { openModal } from 'svelte-modals';
import { base } from '$app/paths';

export async function authenticate() {
	const storage = localStorage.getItem('auth');
	const data = storage ? JSON.parse(storage) : null;

	if (data?.access_token) {
		// connect
		const auth = new Auth(data);
		await webSocket(auth);
	} else {
		// login
		const clientId = genClientId();
		openModal(async () => import('$lib/Modal/LoginModal.svelte'), {
			clientId,
			flow_id: await getFlowId(clientId)
		});
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
				localStorage.removeItem('auth');
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

export async function getFlowId(clientId: string) {
	try {
		const response = await fetch(`${base}/api/auth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ clientId })
		});

		const data = await response.json();

		return data.flow_id;
	} catch (error) {
		console.error('error fetching flow_id:', error);
	}
}
