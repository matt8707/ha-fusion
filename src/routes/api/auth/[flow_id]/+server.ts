import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { flow_id } = params;
		const { username, password, code, clientId, hassUrl } = await request.json();

		let payload;
		if (username && password && clientId) {
			payload = { username, password, client_id: clientId };
		} else if (code && clientId) {
			payload = { code, client_id: clientId };
		}

		const response = await fetch(`${hassUrl}/auth/login_flow/${flow_id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await response.json();

		// if mfa early return
		if (data?.step_id === 'mfa') {
			return json(data);
		}

		// handle success
		if (data?.type === 'create_entry') {
			const body = new URLSearchParams();
			body.append('code', data.result);
			body.append('client_id', clientId);
			body.append('grant_type', 'authorization_code');

			const tokenResponse = await fetch(`${hassUrl}/auth/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body
			});

			const tokens = await tokenResponse.json();

			return json(tokens);
		}

		return json({ error: data });
	} catch (err: any) {
		return error(500, err.message);
	}
};
