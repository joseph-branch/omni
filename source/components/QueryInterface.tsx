import React from 'react';
import {Box} from 'ink';
import {Wizard} from './Wizard/index.js';
import QueryStep from './Wizard/Steps/QueryStep.js';

interface QueryInterfaceProps {
	onComplete?: () => void;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
	onComplete = () => {},
}) => {
	const steps = [
		{
			id: 'query',
			component: <QueryStep />,
		},
	];

	return (
		<Box flexDirection="column" paddingX={0} marginX={0}>
			<Wizard steps={steps} initialStepId="query" onComplete={onComplete} />
		</Box>
	);
};

export default QueryInterface;
