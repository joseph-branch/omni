import {useContext} from 'react';
import {WizardContext, WizardContextType} from '../components/Wizard/Wizard.js';

export function useWizard(): WizardContextType {
	const context = useContext(WizardContext);

	if (!context) {
		throw new Error('useWizard must be used within a Wizard component');
	}

	return context;
}
