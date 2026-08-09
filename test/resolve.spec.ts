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
		command: 'crt',
		query: 'example.com',
		expected: 'https://crt.sh/?q=example.com',
	},
	{
		command: 'drive',
		query: 'quarterly plan',
		expected: 'https://drive.google.com/drive/search?q=quarterly+plan',
	},
	{
		command: 'g',
		query: 'hello world',
		expected: 'https://google.com/search?q=hello+world',
	},
	{
		command: 'gh',
		query: 'owner/repo',
		expected: 'https://github.com/owner/repo',
	},
	{
		command: 'gpt',
		query: 'write a test',
		expected: 'https://chatgpt.com/?q=write+a+test',
	},
	{
		command: 'hn',
		query: 'cloudflare workers',
		expected: 'https://hn.algolia.com/?q=cloudflare+workers',
	},
	{
		command: 'jwt',
		query: 'aaa.bbb.ccc',
		expected: 'https://jwt.io/#debugger-io?token=aaa.bbb.ccc',
	},
	{
		command: 'maps',
		query: 'Seattle, WA',
		expected: 'https://www.google.com/maps?q=Seattle%2C+WA',
	},
	{
		command: 'vt',
		query: 'https://example.com/a?b=c#section',
		expected:
			'https://www.virustotal.com/gui/search/https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc%23section',
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
		expect(resolveRedirect('nonexistent query').href).toBe(
			'https://google.com/search?q=nonexistent+query',
		);
	});

	it('matches command names case-insensitively', () => {
		expect(resolveRedirect('G test search').href).toBe('https://google.com/search?q=test+search');
	});

	it('resolves every command without arguments to its homepage', () => {
		for (const [name, command] of Object.entries(config.commands)) {
			expect(resolveRedirect(name).href).toBe(new URL(command.home).href);
		}
	});

	it('ignores arguments for commands that do not define a search destination', () => {
		expect(resolveRedirect('cal anything').href).toBe(config.commands.cal.home);
	});

	it.each(searchCases)('resolves $command queries', ({ command, query, expected }) => {
		expect(resolveRedirect(`${command} ${query}`).href).toBe(expected);
	});
});
