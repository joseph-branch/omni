import React, {createContext, useContext, useState, ReactNode} from 'react';

export interface Command {
	name: string;
	description: string;
}

interface CommandContextType {
	isCommand: boolean;
	setIsCommand: (value: boolean) => void;
	showCommandMenu: boolean;
	setShowCommandMenu: (value: boolean) => void;
	availableCommands: Command[];
	filteredCommands: Command[];
	setFilteredCommands: (commands: Command[]) => void;
	selectedCommandIndex: number;
	setSelectedCommandIndex: (index: number) => void;
	executeCommand: (commandName: string) => void;
}

// Define available commands for the command menu
const AVAILABLE_COMMANDS: Command[] = [
	{name: 'clear', description: 'Clear the conversation history'},
	{name: 'help', description: 'Show this help message'},
	{name: 'model', description: 'Show current model'},
	{name: 'systemprompt', description: 'Show current system prompt'},
	{
		name: 'systemprompt:set',
		description: 'Set system prompt for current model',
	},
	{
		name: 'systemprompt:default',
		description: 'Set default system prompt for current provider',
	},
];

const CommandContext = createContext<CommandContextType | undefined>(undefined);

interface CommandProviderProps {
	children: ReactNode;
	onExecuteCommand?: (commandName: string) => void;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({
	children,
	onExecuteCommand,
}) => {
	const [isCommand, setIsCommand] = useState(false);
	const [showCommandMenu, setShowCommandMenu] = useState(false);
	const [filteredCommands, setFilteredCommands] =
		useState<Command[]>(AVAILABLE_COMMANDS);
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

	const executeCommand = (commandName: string) => {
		if (onExecuteCommand) {
			onExecuteCommand(commandName);
		}
	};

	const value = {
		isCommand,
		setIsCommand,
		showCommandMenu,
		setShowCommandMenu,
		availableCommands: AVAILABLE_COMMANDS,
		filteredCommands,
		setFilteredCommands,
		selectedCommandIndex,
		setSelectedCommandIndex,
		executeCommand,
	};

	return (
		<CommandContext.Provider value={value}>{children}</CommandContext.Provider>
	);
};

export const useCommand = (): CommandContextType => {
	const context = useContext(CommandContext);

	if (context === undefined) {
		throw new Error('useCommand must be used within a CommandProvider');
	}

	return context;
};
