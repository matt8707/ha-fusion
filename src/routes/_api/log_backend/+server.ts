import type { RequestHandler } from './$types';

// // Example

// async function logBackend(message: string, data: any) {
// 	try {
// 		const response = await fetch(`${base}/_api/server_log`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify({ message, data })
// 		});
// 		const result = await response.json();
// 		console.log(result.status);
// 	} catch (err) {
// 		console.error('Failed to log message to backend:', err);
// 	}
// }

export const POST: RequestHandler = async ({ request }) => {
	const { message, data } = await request.json();

	console.log(message, data);

	return new Response(JSON.stringify({ status: 'Logged' }), {
		headers: {
			'Content-Type': 'application/json'
		},
		status: 200
	});
};
