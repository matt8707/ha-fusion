/**
 * Remove large sveltekit `link` header to be able to run behind reverse proxy
 * `upstream sent too big header while reading response header from upstream`
 */

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event);
	response.headers.delete('link');
	return response;
}
