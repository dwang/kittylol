import { resolveRedirect } from './resolve';

const commonHeaders = {
	'Referrer-Policy': 'no-referrer',
	'X-Robots-Tag': 'noindex',
};

const responseHeaders = {
	...commonHeaders,
	'Cache-Control': 'no-store',
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
		if (requestUrl.pathname === '/favicon.ico') {
			return new Response(null, {
				status: 204,
				headers: {
					...commonHeaders,
					'Cache-Control': 'public, max-age=86400',
				},
			});
		}

		if (requestUrl.pathname !== '/') {
			return new Response(null, {
				status: 404,
				headers: responseHeaders,
			});
		}

		const redirectUrl = resolveRedirect(requestUrl.searchParams.get('q'));

		return new Response(null, {
			status: 302,
			headers: {
				...responseHeaders,
				Location: redirectUrl.href,
			},
		});
	},
} satisfies ExportedHandler<Env>;
