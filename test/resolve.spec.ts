import { describe, expect, it } from 'vitest';
import { config } from '../src/commands';
import { resolveRedirect } from '../src/resolve';

const searchCases = [
	{
		command: 'cs',
		query: 'Array.from',
		expected: 'https://github.com/search?type=code&q=Array.from',
	},
	{
		command: 'docker',
		query: 'postgres alpine',
		expected: 'https://hub.docker.com/search?q=postgres+alpine',
	},
	{
		command: 'drive',
		query: 'quarterly plan',
		expected: 'https://drive.google.com/drive/search?q=quarterly+plan',
	},
	{
		command: 'g',
		query: 'hello world',
		expected: 'https://www.google.com/search?q=hello+world',
	},
	{
		command: 'gh',
		query: 'owner/repo',
		expected: 'https://github.com/owner/repo',
	},
	{
		command: 'gh',
		query: '/owner/repo',
		expected: 'https://github.com/owner/repo',
	},
	{
		command: 'gh',
		query: 'owner/repo#14',
		expected: 'https://github.com/owner/repo/issues/14',
	},
	{
		command: 'gh',
		query: '/owner/repo#14',
		expected: 'https://github.com/owner/repo/issues/14',
	},
	{
		command: 'gh',
		query: '../repo#14',
		expected: 'https://github.com/repo%2314',
	},
	{
		command: 'gh',
		query: 'owner/repo?tab=issues#14',
		expected: 'https://github.com/owner/repo%3Ftab%3Dissues%2314',
	},
	{
		command: 'gh',
		query: 'cloudflare workers',
		expected: 'https://github.com/search?q=cloudflare+workers',
	},
	{
		command: 'gh',
		query: 'owner/repo/blob/main/src/index.ts#L10',
		expected: 'https://github.com/owner/repo/blob/main/src/index.ts%23L10',
	},
	{
		command: 'hn',
		query: 'cloudflare workers',
		expected: 'https://hn.algolia.com/?q=cloudflare+workers',
	},
	{
		command: 'maps',
		query: 'Seattle, WA',
		expected: 'https://www.google.com/maps?q=Seattle%2C+WA',
	},
	{
		command: 'yt',
		query: 'test search',
		expected: 'https://www.youtube.com/results?search_query=test+search',
	},
] as const;

describe('resolveRedirect', () => {
	it('uses the configured default homepage for an empty query', () => {
		expect(resolveRedirect(null).href).toBe(config.default.home);
		expect(resolveRedirect('   ').href).toBe(config.default.home);
	});

	it('sends unknown commands to the default search engine', () => {
		expect(resolveRedirect('nonexistent query').href).toBe('https://www.google.com/search?q=nonexistent+query');
	});

	it('matches command names case-insensitively', () => {
		expect(resolveRedirect('G test search').href).toBe('https://www.google.com/search?q=test+search');
	});

	it('resolves every command without arguments to its homepage', () => {
		for (const [name, command] of Object.entries(config.commands)) {
			expect(resolveRedirect(name).href).toBe(new URL(command.home).href);
		}
	});

	it('falls back to the default search engine when a command has no search destination', () => {
		expect(resolveRedirect('cal anything').href).toBe('https://www.google.com/search?q=cal+anything');
		expect(resolveRedirect('ts satisfies operator').href).toBe('https://www.google.com/search?q=ts+satisfies+operator');
	});

	it('treats Object.prototype property names as unknown commands', () => {
		expect(resolveRedirect('constructor').href).toBe('https://www.google.com/search?q=constructor');
		expect(resolveRedirect('constructor in typescript').href).toBe('https://www.google.com/search?q=constructor+in+typescript');
		expect(resolveRedirect('__proto__').href).toBe('https://www.google.com/search?q=__proto__');
	});

	it('preserves consecutive internal spaces in command queries', () => {
		expect(resolveRedirect('cs   "return  null"').href).toBe('https://github.com/search?type=code&q=%22return++null%22');
	});

	it.each(searchCases)('resolves $command queries', ({ command, query, expected }) => {
		expect(resolveRedirect(`${command} ${query}`).href).toBe(expected);
	});
});
