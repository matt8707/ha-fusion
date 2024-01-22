import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import dotenv from 'dotenv';
dotenv.config();

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const hassUrl = process.env.HASS_URL;
		const { flow_id } = params;
		const { username, password, clientId } = await request.json();

		const response = await fetch(`${hassUrl}/auth/login_flow/${flow_id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username,
				password,
				client_id: clientId
			})
		});

		const data = await response.json();

		// success
		if (data?.type === 'create_entry') {
			// get tokens
			const body = new URLSearchParams();
			body.append('code', data.result);
			body.append('client_id', clientId);
			body.append('grant_type', 'authorization_code');

			const authToken = await fetch(`${hassUrl}/auth/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body
			});

			const tokens = await authToken.json();

			return json(tokens);
		} else {
			// loginData?.type !== 'create_entry'
			return json({ error: data });
		}
	} catch (err: any) {
		error(500, err.message);
	}
};
