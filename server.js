import { handler } from './build/handler.js';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

const app = express();

// environment
dotenv.config();
const ADDON = process.env.ADDON === 'true';
const { PORT, HASS_PORT, EXPOSED_PORT } = process.env;

// dynamically set target
const entryMiddleware = async (req, res, next) => {
	// default
	let target = process.env.HASS_URL;

	if (ADDON) {
		// headers
		const {
			'x-hass-source': source,
			'x-forwarded-proto': forwardedProto,
			'x-forwarded-host': forwardedHost,
			host
		} = req.headers;

		// ingress
		if (source && forwardedProto && forwardedHost) {
			target = `${forwardedProto}://${forwardedHost}`;
		}

		// exposed port
		else if (host && EXPOSED_PORT && HASS_PORT) {
			const proto = req.secure ? 'https' : 'http';
			target = `${proto}://${host.replace(EXPOSED_PORT, HASS_PORT)}`;
		}
	}

	// target should be defined now
	if (!target) {
		throw new Error('Proxy target could not be determined');
	}

	// add header for +page.server.ts
	req.headers['X-Proxy-Target'] = target;
	req.target = target;
	next();
};

// production proxy
const proxy = createProxyMiddleware({
	pathFilter: ['/local/', '/api/'],
	router: (req) => req.target,
	changeOrigin: true
});

app.use(entryMiddleware, proxy);

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(PORT, () => {
	if (ADDON) {
		console.log('ADDON:', ADDON);
		console.log('INGRESS_PORT:', PORT);
		console.log('EXPOSED_PORT:', EXPOSED_PORT);
		console.log('HASS_PORT:', HASS_PORT);
	} else {
		console.log('HASS_URL:', process.env.HASS_URL);
		console.log('PORT:', PORT);
		console.log('ADDON:', ADDON);
	}
});
