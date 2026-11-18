import { describe, expect, it } from 'vitest';
import { config, defineConfig, path, queryParameter } from '../src/commands';

describe('URL builders', () => {
	it('encodes query parameter values without changing URL structure', () => {
		const build = queryParameter('https://example.com/search?type=code', 'q');
		const query = 'a?b=c#section & 100%';
		const result = build(query);

		expect(result.searchParams.get('type')).toBe('code');
		expect(result.searchParams.get('q')).toBe(query);
		expect(result.hash).toBe('');
	});

	it('encodes an entire value placed in a path', () => {
		const build = path('https://example.com/search/');
		const result = build('https://target.example/a?b=c#section');

		expect(result.pathname).toBe('/search/https%3A%2F%2Ftarget.example%2Fa%3Fb%3Dc%23section');
		expect(result.search).toBe('');
		expect(result.hash).toBe('');
	});

	it('can preserve intentional path separators while encoding each segment', () => {
		const build = path('https://example.com/', { preserveSlashes: true });
		const result = build('owner/repo?tab=issues');

		expect(result.pathname).toBe('/owner/repo%3Ftab%3Dissues');
		expect(result.search).toBe('');
	});

	it('prevents dot-segment traversal and keeps %2e%2e encoded in path builders', () => {
		const build = path('https://example.com/search/');

		expect(build('.').href).toBe('https://example.com/search/');
		expect(build('..').href).toBe('https://example.com/search/');
		expect(build('%2e%2e').pathname).toBe('/search/%252e%252e');
	});

	it('strips empty and dot segments when preserving path slashes', () => {
		const rootBuild = path('https://example.com/', { preserveSlashes: true });
		expect(rootBuild('/owner//repo/').pathname).toBe('/owner/repo');
		expect(rootBuild('/').pathname).toBe('/');

		const prefixBuild = path('https://example.com/org/', { preserveSlashes: true });
		expect(prefixBuild('../admin').pathname).toBe('/org/admin');
		expect(prefixBuild('./team/..').pathname).toBe('/org/team');
	});
});

describe('command configuration', () => {
	it('rejects non-HTTPS home URLs in defineConfig', () => {
		expect(() =>
			defineConfig({
				default: {
					home: 'http://example.com/',
					search: queryParameter('https://example.com/search', 'q'),
				},
				commands: {},
			}),
		).toThrow(TypeError);

		expect(() =>
			defineConfig({
				default: {
					home: 'https://example.com/',
					search: queryParameter('https://example.com/search', 'q'),
				},
				commands: {
					insecure: {
						home: 'http://example.com/',
					},
				},
			}),
		).toThrow(TypeError);
	});

	it('uses lowercase unique command names and valid HTTPS destinations', () => {
		const names = Object.keys(config.commands);
		expect(new Set(names).size).toBe(names.length);

		for (const name of names) {
			expect(name).toBe(name.toLowerCase());
		}

		for (const command of [config.default, ...Object.values(config.commands)]) {
			expect(new URL(command.home).protocol).toBe('https:');
			if (command.search) {
				expect(command.search('validation ?#/%').protocol).toBe('https:');
			}
		}
	});
});
