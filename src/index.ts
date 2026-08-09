import { resolveRedirect } from './resolve';

const responseHeaders = {
	'Cache-Control': 'no-store',
	'Referrer-Policy': 'no-referrer',
};

export default {
	fetch(request: Request): Response {
		if (request.method !== 'GET' && request.method !== 'HEAD') {
			return new Response(null, {
				status: 405,
				headers: {
					...responseHeaders,
					Allow: 'GET, HEAD',
				},
			});
		}

		const requestUrl = new URL(request.url);
		const redirectUrl = resolveRedirect(requestUrl.searchParams.get('q'));

		return new Response(null, {
			status: 302,
			headers: {
				...responseHeaders,
				Location: redirectUrl.href,
			},
		});
	},
} satisfies ExportedHandler;
