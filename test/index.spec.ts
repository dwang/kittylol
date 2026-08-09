import { describe, expect, it } from 'vitest';
import { config } from '../src/commands';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Worker HTTP adapter', () => {
	it('redirects GET requests and disables caching and referrers', () => {
		const response = worker.fetch(new IncomingRequest('https://example.com/?q=g+test+search'));

		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('https://google.com/search?q=test+search');
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
	});

	it('redirects HEAD requests', () => {
		const response = worker.fetch(new IncomingRequest('https://example.com', { method: 'HEAD' }));

		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(config.default.home);
	});

	it('rejects methods other than GET and HEAD', () => {
		const response = worker.fetch(new IncomingRequest('https://example.com', { method: 'POST' }));

		expect(response.status).toBe(405);
		expect(response.headers.get('Allow')).toBe('GET, HEAD');
		expect(response.headers.get('Cache-Control')).toBe('no-store');
	});
});
