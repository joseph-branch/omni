#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import figlet from 'figlet';
import chalk from 'chalk';
import App from './app.js';
import Initialize from './components/Initialize.js';
import LoopingInitialize from './components/LoopingInitialize.js';
import RemoveConfig from './components/RemoveConfig.js';
import QueryInterface from './components/QueryInterface.js';
import {
	configExists,
	isInitializationCompleted,
	resetInitializationState,
} from './utils/config.js';

// Print OMNI in blue using figlet, centered in the terminal
const figletText = figlet.textSync('OMNI');
const lines = figletText.split('\n');
const terminalWidth = process.stdout.columns || 80;
const centeredLines = lines.map(line => {
	const padding = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
	return ' '.repeat(padding) + line;
});
console.log(chalk.blue(centeredLines.join('\n')));

const cli = meow(
	`
	Usage
	  $ omni [command]

	Commands
	  config       Configure API keys and default model
	  config:loop  Example of a looping configuration wizard
	  config:rm    Remove all configuration
	  config:reset Reset the configuration process
	  query        Interactive LLM query interface

	Options
		--name  Your name

	Examples
	  $ omni
	  Hello, User

	  $ omni config
	  Starts the configuration wizard
	  
	  $ omni config:loop
	  Starts the looping configuration wizard example
	  
	  $ omni config:rm
	  Removes all configuration
	  
	  $ omni config:reset
	  Resets the configuration process
	  
	  $ omni query
	  Starts the interactive LLM query interface
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
		},
	},
);

// Handle commands
const [command] = cli.input;

if (command === 'config') {
	// Force reconfiguration
	render(
		<Initialize
			onComplete={() => {
				console.log('Configuration complete!');
				process.exit(0);
			}}
			onCancel={() => {
				console.log('Configuration cancelled. CLI will remain unconfigured.');
				process.exit(1);
			}}
		/>,
	);
} else if (command === 'config:loop') {
	// Example of looping wizard
	render(
		<LoopingInitialize
			onComplete={() => {
				console.log('Looping configuration example complete!');
				process.exit(0);
			}}
		/>,
	);
} else if (command === 'config:rm') {
	// Remove configuration
	render(
		<RemoveConfig
			onComplete={() => {
				console.log('Configuration removal process complete!');
				process.exit(0);
			}}
		/>,
	);
} else if (command === 'config:reset') {
	// Reset configuration process
	if (configExists()) {
		resetInitializationState();
		console.log(
			'Configuration process has been reset. Run "omni config" to start over.',
		);
	} else {
		console.log(
			'No configuration found. Run "omni config" to start the setup process.',
		);
	}
} else if (command === 'query') {
	// Check if CLI is configured
	if (!configExists() || !isInitializationCompleted()) {
		console.log(
			'Omni CLI is not configured. Please run "omni config" to set up.',
		);
		process.exit(1);
	}

	// Launch the query interface
	render(
		<QueryInterface
			onComplete={() => {
				console.log('Query session complete.');
				process.exit(0);
			}}
		/>,
	);
} else {
	// Check if CLI is configured
	if (!configExists() || !isInitializationCompleted()) {
		console.log(
			'Omni CLI is not configured. Please run "omni config" to set up.',
		);
		process.exit(1);
	}

	// Normal app flow
	render(<App name={cli.flags.name} />);
}
