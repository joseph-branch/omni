# Omni CLI

An agentic command-line interface for interacting with different AI models within the same session. **Currently in early alpha stages.**

## Project Status

Omni CLI is currently in early alpha development. Features may change, and there might be bugs or incomplete functionality. Use at your own risk and please report any issues you encounter.

## Project Structure

The project is organized in a maintainable and easy-to-navigate structure:

```
source/
├── app.tsx                 # Main application entry point
├── cli.tsx                 # CLI entry point
├── agent.ts                # AI response generation logic
├── components/             # UI components
│   ├── Initialize.tsx      # Initialization component
│   ├── QueryInterface.tsx  # Main query interface
│   └── Wizard/             # Wizard component for step-by-step flows
│       ├── Steps/          # Individual wizard steps
│       └── Wizard.tsx      # Wizard component implementation
├── contexts/               # React contexts for state management
│   ├── AppContext.tsx      # Application-level state
│   ├── CommandContext.tsx  # Command-related state and functionality
│   ├── MessageContext.tsx  # Conversation message history and context
│   ├── ModelContext.tsx    # Model selection and configuration
│   └── QueryContext.tsx    # Query state and history
├── hooks/                  # Custom React hooks
│   ├── useApi.tsx          # Hook for API interactions
│   ├── useKeyboardShortcuts.tsx # Keyboard shortcut handling
│   └── useWizard.tsx       # Hook for wizard functionality
├── tools/                  # AI tools implementation
└── utils/                  # Utility functions
    └── config.ts           # Configuration management
```

## Architecture

The application follows a clean architecture with separation of concerns:

1. **Contexts**: Manage global state and provide access to it through hooks
2. **Hooks**: Encapsulate reusable logic and side effects
3. **Components**: UI elements that consume contexts and hooks
4. **Utils**: Pure utility functions

## Key Features

- **Multiple AI Model Support**: Integrates with OpenAI, Anthropic, Mistral, and Google AI models
- **Persistent Conversation Context**: Maintains conversation history throughout the session
- **Command System**: Rich set of slash commands for controlling the application
- **System Prompt Customization**: Customize system prompts per model or provider
- **Interactive UI**: Terminal-based UI with keyboard shortcuts and command completion

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Run the application:
   ```
   npm start
   ```

## Development

To add new features:

1. Identify which layer the feature belongs to (context, hook, component, or utility)
2. Implement the feature in the appropriate file
3. Export and import as needed
4. Update tests if applicable

## Commands

The application supports the following commands:

- `/clear` - Clear the conversation history display
- `/clear:context` - Clear the conversation context (memory)
- `/context` - Show information about the current conversation context
- `/help` - Show help message
- `/model` - Show current model
- `/model:set <provider:model>` - Set the current model
- `/systemprompt` - Show current system prompt
- `/systemprompt:set <prompt>` - Set system prompt for current model
- `/systemprompt:default <prompt>` - Set default system prompt for current provider

## Conversation Context

Omni CLI maintains a conversation context that persists throughout your session. This allows the AI to remember previous interactions and maintain context across multiple queries and models. The context includes:

- User messages
- AI responses
- System prompts

You can manage the conversation context using the `/context` and `/clear:context` commands.

## Roadmap

- Improve error handling and recovery
- Add support for more AI providers
- Implement conversation saving and loading
- Add plugin system for extending functionality
- Improve performance and reduce latency

## Contributing

Contributions are welcome! As this is an alpha project, please open an issue first to discuss what you would like to change.
