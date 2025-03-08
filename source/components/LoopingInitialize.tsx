import React from 'react';
import {Wizard} from './Wizard/index.js';
import {
	WelcomeStep,
	ApiKeyStep,
	ModelSelectionStep,
	CompletionStep,
	LoopingStep,
} from './Wizard/Steps/index.js';

type LoopingInitializeProps = {
	onComplete: () => void;
};

// Step IDs
const STEPS = {
	WELCOME: 'welcome',
	OPENAI_API_KEY: 'openai_api_key',
	ANTHROPIC_API_KEY: 'anthropic_api_key',
	MISTRAL_API_KEY: 'mistral_api_key',
	MODEL_SELECTION: 'model_selection',
	LOOPING_DECISION: 'looping_decision',
	COMPLETION: 'completion',
};

export default function LoopingInitialize({
	onComplete,
}: LoopingInitializeProps) {
	return (
		<Wizard
			steps={[
				{
					id: STEPS.WELCOME,
					component: (
						<WelcomeStep
							title="Welcome to Looping Wizard Example"
							message="This example demonstrates how to create a wizard that can loop back to previous steps."
						/>
					),
				},
				{
					id: STEPS.OPENAI_API_KEY,
					component: <ApiKeyStep provider="openai" />,
				},
				{
					id: STEPS.ANTHROPIC_API_KEY,
					component: <ApiKeyStep provider="anthropic" />,
				},
				{
					id: STEPS.MISTRAL_API_KEY,
					component: <ApiKeyStep provider="mistral" />,
				},
				{
					id: STEPS.MODEL_SELECTION,
					component: <ModelSelectionStep />,
				},
				{
					id: STEPS.LOOPING_DECISION,
					component: (
						<LoopingStep
							title="What would you like to do next?"
							message="You can continue to complete the wizard, or loop back to configure more settings."
							nextStepId={STEPS.COMPLETION}
							loopBackStepId={STEPS.OPENAI_API_KEY}
							completeStepId={STEPS.COMPLETION}
						/>
					),
				},
				{
					id: STEPS.COMPLETION,
					component: (
						<CompletionStep
							title="Setup Complete!"
							message="Your configuration is now complete."
							showCompleteButton={true}
						/>
					),
				},
			]}
			initialStepId={STEPS.WELCOME}
			onComplete={onComplete}
		/>
	);
}
