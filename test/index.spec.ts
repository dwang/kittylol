// test/index.spec.ts
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import config from '../config.json';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('kittylol', () => {
	it('redirects to default URL when no query is provided', async () => {
		const request = new IncomingRequest('http://example.com');
		const response = await worker.fetch(request);
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(config.default.baseUrl);
	});

	it('redirects to default search URL when command is not found', async () => {
		const request = new IncomingRequest('http://example.com/?q=nonexistent+query');
		const response = await worker.fetch(request);

		const expectedUrl = config.default.searchUrlTemplate.replace('{query}', encodeURIComponent('nonexistent query'));
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(expectedUrl);
	});

	it('redirects to baseUrl when command exists but no search query is provided', async () => {
		const request = new IncomingRequest('http://example.com/?q=g');
		const response = await worker.fetch(request);

		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(config.commands.g.baseUrl);
	});

	it('redirects to search URL when command and search query are provided', async () => {
		const request = new IncomingRequest('http://example.com/?q=g+test+search');
		const response = await worker.fetch(request);

		const expectedUrl = config.commands.g.searchUrlTemplate.replace('{query}', encodeURIComponent('test search'));
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(expectedUrl);
	});

	it('redirects to baseUrl when command exists but has no searchUrlTemplate', async () => {
		const request = new IncomingRequest('http://example.com/?q=cal+anything');
		const response = await worker.fetch(request);

		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(config.commands.cal.baseUrl);
	});

	it('handles case insensitivity for commands', async () => {
		const request = new IncomingRequest('http://example.com/?q=G+test+search');
		const response = await worker.fetch(request);

		const expectedUrl = config.commands.g.searchUrlTemplate.replace('{query}', encodeURIComponent('test search'));
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(expectedUrl);
	});

	it('handles encoding for URL paths without a query string', async () => {
		const request = new IncomingRequest('http://example.com/?q=gh+user/repo');
		const response = await worker.fetch(request);

		const expectedUrl = config.commands.gh.searchUrlTemplate.replace('{query}', 'user/repo');
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(expectedUrl);
	});

	it('handles URLs with query parameters correctly', async () => {
		const request = new IncomingRequest('http://example.com/?q=yt+test+search');
		const response = await worker.fetch(request);

		const expectedUrl = config.commands.yt.searchUrlTemplate.replace('{query}', encodeURIComponent('test search'));
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(expectedUrl);
	});
});
