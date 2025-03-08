import React, {useEffect} from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';

import {useWizard} from '../../../hooks/useWizard.js';
import {useQuery} from '../../../contexts/QueryContext.js';
import {useCommand} from '../../../contexts/CommandContext.js';
import {useModel} from '../../../contexts/ModelContext.js';
import {useMessages} from '../../../contexts/MessageContext.js';
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
		availableModels,
		setCurrentModel,
		refreshModels,
	} = useModel();

	// Use message context
	const {messages, addMessage, clearMessages, getRecentMessages} =
		useMessages();

	// Use API hook
	const {sendQuery} = useApi();

	// Refresh models list on mount
	useEffect(() => {
		refreshModels();
	}, []);

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
				addToHistory({
					query: '/clear',
					response: 'Conversation history display cleared.',
				});
				break;
			case 'clear:context':
				clearMessages();
				addToHistory({
					query: '/clear:context',
					response:
						'Conversation context (memory) cleared. The AI will no longer remember previous messages.',
				});
				break;
			case 'context':
				const contextSize = messages.length;
				const userMessages = messages.filter(m => m.role === 'user').length;
				const assistantMessages = messages.filter(
					m => m.role === 'assistant',
				).length;

				addToHistory({
					query: '/context',
					response: `Conversation context information:
- Total messages: ${contextSize}
- User messages: ${userMessages}
- Assistant messages: ${assistantMessages}
- Messages used for context: ${Math.min(contextSize, 10)} (last 10 messages)`,
				});
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
				// Show current model and list all available models
				const availableModelsList = availableModels
					.map(
						m =>
							`${m.provider}:${m.model}${
								m.model === currentModel ? ' (current)' : ''
							}`,
					)
					.join('\n');

				addToHistory({
					query: '/model',
					response: `Current model: ${currentProvider}:${currentModel}\n\nAvailable models:\n${availableModelsList}`,
				});
				break;
			case 'model:set':
				// Show available models
				refreshModels();
				const modelList = availableModels
					.map(m => `${m.provider}:${m.model}`)
					.join('\n');
				addToHistory({
					query: '/model:set',
					response:
						'Available models:\n' +
						modelList +
						'\n\nTo set a model, use: /model:set <provider:model> or /model:set <model>',
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
			} else if (commandName === 'model:set' && args.length > 0) {
				const modelArg = args.join(' ');

				// Check if the format is provider:model
				if (modelArg.includes(':')) {
					const [providerName, modelName] = modelArg.split(':');
					// Find the model in availableModels

					const modelInfo = availableModels.find(
						m => m.provider === providerName && m.model === modelName,
					);

					if (modelInfo) {
						setCurrentModel(modelInfo.model);
						addToHistory({
							query: query,
							response: `Model switched to ${providerName}:${modelName}`,
						});
					} else {
						addToHistory({
							query: query,
							response: `Model ${providerName}:${modelName} not found`,
						});
					}
				} else {
					// Just model name provided, find the first matching model
					const modelInfo = availableModels.find(m => m.model === modelArg);

					if (modelInfo) {
						setCurrentModel(modelInfo.model);
						addToHistory({
							query: query,
							response: `Model switched to ${modelInfo.provider}:${modelInfo.model}`,
						});
					} else {
						addToHistory({
							query: query,
							response: `Model ${modelArg} not found`,
						});
					}
				}
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
			// Add user message to context
			addMessage({role: 'user', content: query});

			// Send query to API using messages from context
			const response = await sendQuery(query, getRecentMessages());

			// Add assistant response to context
			addMessage({role: 'assistant', content: response});

			// Add to history (for UI display)
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

			// Add error message to context
			addMessage({role: 'assistant', content: errorMessage});

			// Add to history
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
						<Box>
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
				</Box>
			</Box>

			{/* Command menu */}
			{showCommandMenu && (
				<>
					{filteredCommands.map((command, index) => (
						<Box key={command.name}>
							<Text color={index === selectedCommandIndex ? 'blue' : undefined}>
								/{command.name} - {command.description}
							</Text>
						</Box>
					))}
				</>
			)}
		</Box>
	);
};

export default QueryStep;
