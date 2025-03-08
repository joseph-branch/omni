import React from 'react';
import {Text, Box} from 'ink';
import Initialize from './components/Initialize.js';
import QueryInterface from './components/QueryInterface.js';
import {AppProvider, useApp} from './contexts/AppContext.js';
import {QueryProvider} from './contexts/QueryContext.js';
import {CommandProvider} from './contexts/CommandContext.js';
import {ModelProvider} from './contexts/ModelContext.js';
import {MessageProvider} from './contexts/MessageContext.js';

interface AppProps {
	name?: string;
}

const AppContent: React.FC<AppProps> = ({name}) => {
	const {isInitialized, config, setInitialized} = useApp();

	// Handle initialization completion
	const handleInitComplete = () => {
		setInitialized(true);
	};

	// Handle initialization cancellation
	const handleInitCancel = () => {
		console.log('Initialization cancelled');
		process.exit(1);
	};

	// Handle query completion
	const handleQueryComplete = () => {
		process.exit(0);
	};

	// Show loading state while checking initialization
	if (isInitialized === null) {
		return <Text>Loading...</Text>;
	}

	// Show initialization flow if not initialized
	if (!isInitialized) {
		return (
			<Initialize onComplete={handleInitComplete} onCancel={handleInitCancel} />
		);
	}

	// Show main app UI with query interface
	return (
		<Box flexDirection="column" padding={0}>
			{name && (
				<Box marginBottom={1}>
					<Text>
						Hello, <Text color="green">{name}</Text>
					</Text>
				</Box>
			)}
			{config && (
				<Box flexDirection="column" marginBottom={0} paddingX={0} marginX={0}>
					<QueryProvider>
						<CommandProvider>
							<ModelProvider>
								<MessageProvider>
									<QueryInterface onComplete={handleQueryComplete} />
								</MessageProvider>
							</ModelProvider>
						</CommandProvider>
					</QueryProvider>
				</Box>
			)}
		</Box>
	);
};

export default function App(props: AppProps) {
	return (
		<AppProvider>
			<AppContent {...props} />
		</AppProvider>
	);
}
