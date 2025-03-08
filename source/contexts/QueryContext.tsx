import React, {createContext, useContext, useState, ReactNode} from 'react';

export interface HistoryEntry {
	query: string;
	response: string;
}

interface QueryContextType {
	query: string;
	setQuery: (value: string) => void;
	isLoading: boolean;
	setIsLoading: (value: boolean) => void;
	history: HistoryEntry[];
	addToHistory: (entry: HistoryEntry) => void;
	clearHistory: () => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

interface QueryProviderProps {
	children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({children}) => {
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [history, setHistory] = useState<HistoryEntry[]>([]);

	const addToHistory = (entry: HistoryEntry) => {
		setHistory(prev => [entry, ...prev]);
	};

	const clearHistory = () => {
		setHistory([]);
	};

	const value = {
		query,
		setQuery,
		isLoading,
		setIsLoading,
		history,
		addToHistory,
		clearHistory,
	};

	return (
		<QueryContext.Provider value={value}>{children}</QueryContext.Provider>
	);
};

export const useQuery = (): QueryContextType => {
	const context = useContext(QueryContext);

	if (context === undefined) {
		throw new Error('useQuery must be used within a QueryProvider');
	}

	return context;
};
