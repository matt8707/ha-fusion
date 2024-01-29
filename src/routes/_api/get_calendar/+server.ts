import { json, error } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	try {
		const body = await request.json();

		const { url, token } = body;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();

		if (response.ok) {
			return json(data);
		}
	} catch (err: any) {
		error(500, err.message);
	}
};
