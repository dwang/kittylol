import { config } from './commands';

export function resolveRedirect(rawQuery: string | null | undefined): URL {
	const normalizedQuery = rawQuery?.trim();
	if (!normalizedQuery) {
		return new URL(config.default.home);
	}

	const [rawCommand, ...queryParts] = normalizedQuery.split(/\s+/);
	const command = config.commands[rawCommand.toLowerCase()];
	const query = queryParts.join(' ');

	if (!command) {
		return config.default.search(normalizedQuery);
	}

	if (!query || !command.search) {
		return new URL(command.home);
	}

	return command.search(query);
}
