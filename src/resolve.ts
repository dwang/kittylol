import { config } from './commands';

export function resolveRedirect(rawQuery: string | null | undefined): URL {
	const normalizedQuery = rawQuery?.trim();
	if (!normalizedQuery) {
		return new URL(config.default.home);
	}

	const whitespaceIndex = normalizedQuery.search(/\s/);
	const rawCommand = whitespaceIndex === -1 ? normalizedQuery : normalizedQuery.slice(0, whitespaceIndex);
	const query = whitespaceIndex === -1 ? '' : normalizedQuery.slice(whitespaceIndex).trimStart();

	const commandName = rawCommand.toLowerCase();
	const command = Object.hasOwn(config.commands, commandName) ? config.commands[commandName] : undefined;

	if (!command) {
		return config.default.search(normalizedQuery);
	}

	if (!query) {
		return new URL(command.home);
	}

	if (!command.search) {
		return config.default.search(normalizedQuery);
	}

	return command.search(query);
}
