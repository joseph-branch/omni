import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import {configExists, readConfig, OmniConfig} from '../utils/config.js';

interface AppContextType {
	isInitialized: boolean | null;
	config: OmniConfig | null;
	setInitialized: (value: boolean) => void;
	refreshConfig: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
	children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
	const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
	const [config, setConfig] = useState<OmniConfig | null>(null);

	// Check if config exists on mount
	useEffect(() => {
		const exists = configExists();
		setIsInitialized(exists);

		if (exists) {
			setConfig(readConfig());
		}
	}, []);

	const refreshConfig = () => {
		setConfig(readConfig());
	};

	const value = {
		isInitialized,
		config,
		setInitialized: (value: boolean) => setIsInitialized(value),
		refreshConfig,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
	const context = useContext(AppContext);

	if (context === undefined) {
		throw new Error('useApp must be used within an AppProvider');
	}

	return context;
};
