import {
	getAuth,
	createConnection,
	subscribeConfig,
	subscribeEntities,
	ERR_CANNOT_CONNECT,
	ERR_INVALID_AUTH,
	ERR_CONNECTION_LOST,
	ERR_HASS_HOST_REQUIRED,
	ERR_INVALID_HTTPS_TO_HTTP
} from 'home-assistant-js-websocket';
import type { SaveTokensFunc } from 'home-assistant-js-websocket';
import { states, connection, config, connected } from '$lib/Stores';

export const options = {
	hassUrl: undefined as string | undefined,
	async loadTokens() {
		try {
			return JSON.parse(localStorage.hassTokens);
		} catch (error) {
			return undefined;
		}
	},
	saveTokens(tokens: SaveTokensFunc) {
		localStorage.hassTokens = JSON.stringify(tokens);
	},
	clearTokens() {
		localStorage.hassTokens = null;
	}
};

export async function authentication(options: { hassUrl?: string }) {
	let auth;

	try {
		auth = await getAuth(options);
		if (auth.expired) {
			auth.refreshAccessToken();
		}
	} catch (_error) {
		handleError(_error);
	}

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

		// clear auth query string
		if (location.search.includes('auth_callback=1')) {
			history.replaceState(null, '', location.pathname);
		}
	} catch (_error) {
		handleError(_error);
	}
}

// error string instead of code
function handleError(_error: unknown) {
	switch (_error) {
		case ERR_INVALID_AUTH:
			console.error('ERR_INVALID_AUTH');
			options.clearTokens();
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
			console.error(_error);
	}
	throw _error;
}
