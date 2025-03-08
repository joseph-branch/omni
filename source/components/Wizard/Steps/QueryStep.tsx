import React, {useEffect} from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';

import {useWizard} from '../../../hooks/useWizard.js';
import {useQuery} from '../../../contexts/QueryContext.js';
import {useCommand} from '../../../contexts/CommandContext.js';
import {useModel} from '../../../contexts/ModelContext.js';
import {useApi} from '../../../hooks/useApi.js';
import {useKeyboardShortcuts} from '../../../hooks/useKeyboardShortcuts.js';

const QueryStep: React.FC = () => {
	// Use contexts
	useWizard();
	const {
		query,
		setQuery,
		isLoading,
		setIsLoading,
		history,
		addToHistory,
		clearHistory,
	} = useQuery();

	const {
		isCommand,
		setIsCommand,
		showCommandMenu,
		setShowCommandMenu,
		availableCommands,
		filteredCommands,
		setFilteredCommands,
		selectedCommandIndex,
		setSelectedCommandIndex,
	} = useCommand();

	const {
		currentModel,
		currentProvider,
		systemPrompt,
		updateSystemPrompt,
		updateDefaultSystemPrompt,
	} = useModel();

	// Use API hook
	const {sendQuery} = useApi();

	// Focus the input on mount and log the prompt
	useEffect(() => {
		// Hide the terminal cursor
		process.stdout.write('\x1B[?25l');

		// Cleanup function to restore cursor when component unmounts
		return () => {
			process.stdout.write('\x1B[?25h');
		};
	}, []);

	// Handle command menu visibility
	useEffect(() => {
		if (query.startsWith('/')) {
			setIsCommand(true);
			const commandText = query.slice(1).toLowerCase();

			// Filter commands based on input
			const filtered = availableCommands.filter(cmd =>
				cmd.name.toLowerCase().includes(commandText),
			);

			setFilteredCommands(filtered);
			setShowCommandMenu(filtered.length > 0);
			setSelectedCommandIndex(0);
		} else {
			setIsCommand(false);
			setShowCommandMenu(false);
		}
	}, [query, availableCommands]);

	// Handle keyboard shortcuts
	useKeyboardShortcuts({
		onArrowUp: () => {
			if (showCommandMenu && selectedCommandIndex > 0) {
				setSelectedCommandIndex(selectedCommandIndex - 1);
			}
		},
		onArrowDown: () => {
			if (
				showCommandMenu &&
				selectedCommandIndex < filteredCommands.length - 1
			) {
				setSelectedCommandIndex(selectedCommandIndex + 1);
			}
		},
		onTab: () => {
			if (showCommandMenu && filteredCommands.length > 0) {
				const selectedCommand = filteredCommands[selectedCommandIndex];
				if (selectedCommand) {
					setQuery(`/${selectedCommand.name}`);
				}
			}
		},
		onEscape: () => {
			if (showCommandMenu) {
				setShowCommandMenu(false);
			}
		},
		onSlash: () => {
			if (query === '') {
				setQuery('/');
			}
		},
		enabled: !isLoading,
	});

	// Execute command
	const executeCommand = (commandName: string) => {
		switch (commandName) {
			case 'clear':
				clearHistory();
				break;
			case 'help':
				addToHistory({
					query: '/help',
					response:
						'Available commands:\n' +
						availableCommands
							.map(cmd => `/${cmd.name} - ${cmd.description}`)
							.join('\n'),
				});
				break;
			case 'model':
				addToHistory({
					query: '/model',
					response: `Current model: ${currentProvider}:${currentModel}`,
				});
				break;
			case 'systemprompt':
				addToHistory({
					query: '/systemprompt',
					response: `Current system prompt: ${systemPrompt}`,
				});
				break;
			case 'systemprompt:set':
				// This would typically prompt for a new system prompt
				// For now, we'll just show a message
				addToHistory({
					query: '/systemprompt:set',
					response:
						'To set a system prompt, use: /systemprompt:set <your prompt here>',
				});
				break;
			case 'systemprompt:default':
				// This would typically prompt for a new default system prompt
				// For now, we'll just show a message
				addToHistory({
					query: '/systemprompt:default',
					response:
						'To set a default system prompt, use: /systemprompt:default <your prompt here>',
				});
				break;
			default:
				addToHistory({
					query: `/${commandName}`,
					response: `Unknown command: ${commandName}`,
				});
		}
	};

	// Handle command execution from input
	const handleCommandExecution = () => {
		if (isCommand && query.startsWith('/')) {
			const commandText = query.slice(1);

			// Check for command with arguments
			const [commandName, ...args] = commandText.split(' ');

			if (commandName === 'systemprompt:set' && args.length > 0) {
				const newPrompt = args.join(' ');
				updateSystemPrompt(newPrompt);
				addToHistory({
					query: query,
					response: `System prompt updated for model ${currentModel}`,
				});
			} else if (commandName === 'systemprompt:default' && args.length > 0) {
				const newPrompt = args.join(' ');
				updateDefaultSystemPrompt(newPrompt);
				addToHistory({
					query: query,
					response: `Default system prompt updated for provider ${currentProvider}`,
				});
			} else if (commandName) {
				// Execute regular command only if commandName is defined
				executeCommand(commandName);
			}

			setQuery('');
			return true;
		}

		return false;
	};

	// Handle query change
	const handleQueryChange = (value: string) => {
		setQuery(value);
	};

	// Handle submit
	const handleSubmit = async () => {
		if (query.trim() === '') return;

		// Check if it's a command
		if (handleCommandExecution()) return;

		setIsLoading(true);

		try {
			// Send query to API
			const response = await sendQuery(query, {
				model: currentModel,
				systemPrompt,
			});

			// Add to history
			addToHistory({
				query,
				response,
			});
		} catch (err) {
			// Handle error
			const errorMessage =
				err instanceof Error
					? err.message
					: 'An error occurred while processing your request';

			addToHistory({
				query,
				response: errorMessage,
			});
		} finally {
			setIsLoading(false);
			setQuery('');
		}
	};

	return (
		<Box flexDirection="column" marginY={1} marginX={0} paddingX={0}>
			{/* History display - above the query box */}
			{history.length > 0 && (
				<Box flexDirection="column" marginBottom={1} paddingX={0} marginX={0}>
					<Box marginLeft={2}>
						<Text>{history[0]?.response}</Text>
					</Box>
				</Box>
			)}

			{/* Query input box */}
			<Box borderStyle="round" borderColor="blue" paddingX={0} marginX={0}>
				<Box flexDirection="column" paddingX={0} marginX={0}>
					<Box>
						<Box width={21}>
							<Text>{`${currentProvider}:${currentModel} > `}</Text>
						</Box>
						<TextInput
							value={query}
							onChange={handleQueryChange}
							onSubmit={handleSubmit}
							placeholder="How can I help you today?"
						/>
					</Box>

					{isLoading && (
						<Box marginLeft={2} marginTop={1}>
							<Text>Loading...</Text>
						</Box>
					)}

					{/* Command menu */}
					{showCommandMenu && (
						<Box
							flexDirection="column"
							marginLeft={2}
							marginTop={1}
							borderStyle="round"
							paddingX={1}
							paddingY={1}
						>
							{filteredCommands.map((command, index) => (
								<Box key={command.name}>
									<Text
										color={index === selectedCommandIndex ? 'blue' : undefined}
									>
										{command.name} - {command.description}
									</Text>
								</Box>
							))}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default QueryStep;
