import { handler } from './build/handler.js';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

let logTarget;

const app = express();

// environment
const ADDON = process.env.ADDON === 'true';
const PORT = process.env.PORT;
const HASS_PORT = process.env.HASS_PORT;
const EXPOSED_PORT = process.env.EXPOSED_PORT;

// dynamically set target for proxy middleware
function customRouter(req) {
	let target = process.env.HASS_URL;

	if (ADDON) {
		// headers
		const source = req.headers['x-hass-source'];
		const forwardedProto = req.headers['x-forwarded-proto'];
		const forwardedHost = req.headers['x-forwarded-host'];
		const host = req.headers['host'];

		// ingress
		if (source && forwardedProto && forwardedHost) {
			target = `${forwardedProto}://${forwardedHost}`;
		}

		// exposed port
		else if (host && EXPOSED_PORT && HASS_PORT) {
			target = `http://${host.replace(EXPOSED_PORT, HASS_PORT)}`;
		}
	}

	// target should be defined now
	if (!target) {
		throw new Error('Proxy target could not be determined');
	}

	// log actual target instead of placeholder `...` because
	// the router gets invoked before headers are processed
	if (!logTarget) {
		logTarget = `... -> ${target}`;
		console.log(logTarget);
	}

	return target;
}

// production proxy
app.use(
	['/local/', '/api/'],
	createProxyMiddleware({
		target: '...',
		router: customRouter,
		changeOrigin: true
	})
);

// let sveltekit handle everything else
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
