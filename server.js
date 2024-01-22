import { handler } from './build/handler.js';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const HASS_URL = process.env.HASS_URL;
const PORT = process.env.PORT;

// production proxy
if (HASS_URL) {
	app.use(
		['/local/', '/api/image/', '/api/*_proxy*'],
		createProxyMiddleware({
			target: HASS_URL,
			changeOrigin: true
		})
	);
}

// let sveltekit handle everything else
app.use(handler);

app.listen(PORT, () => {
	console.debug(`ENV HASS_URL: ${HASS_URL}`);
	console.debug(`ENV PORT: ${PORT}`);
	console.debug(`ENV ADDON ${process.env.ADDON || false}`);
});
