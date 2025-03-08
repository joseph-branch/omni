import React, {createContext, useContext, useState, ReactNode} from 'react';

// Define the message interface
export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

// Define the context type
interface MessageContextType {
	messages: Message[];
	addMessage: (message: Message) => void;
	clearMessages: () => void;
	getRecentMessages: (count?: number) => Message[];
}

// Create the context
const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Create the provider component
interface MessageProviderProps {
	children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({children}) => {
	const [messages, setMessages] = useState<Message[]>([]);

	// Add a new message to the conversation
	const addMessage = (message: Message) => {
		setMessages(prevMessages => [...prevMessages, message]);
	};

	// Clear all messages
	const clearMessages = () => {
		setMessages([]);
	};

	// Get the most recent messages (for context window management)
	const getRecentMessages = (count = 10): Message[] => {
		return messages.slice(-count);
	};

	const value = {
		messages,
		addMessage,
		clearMessages,
		getRecentMessages,
	};

	return (
		<MessageContext.Provider value={value}>{children}</MessageContext.Provider>
	);
};

// Create the hook to use the context
export const useMessages = (): MessageContextType => {
	const context = useContext(MessageContext);

	if (context === undefined) {
		throw new Error('useMessages must be used within a MessageProvider');
	}

	return context;
};
