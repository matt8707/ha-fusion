import { handler } from './build/handler.js';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// dotenv is only used for local build
// it's not used when building container
dotenv.config();

const app = express();
const PORT = 5050;

// production proxy
if (process.env.HASS_URL) {
	app.use(
		['/local/', '/api/*_proxy*'],
		createProxyMiddleware({
			target: process.env.HASS_URL,
			changeOrigin: true
		})
	);
}

// let sveltekit handle everything else
app.use(handler);

app.listen(PORT, () => {
	console.debug(`listening on port ${PORT}`);
});
