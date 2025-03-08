# Omni CLI

A command-line interface for interacting with AI models.

## Project Structure

The project is organized in a maintainable and easy-to-navigate structure:

```
source/
├── app.tsx                 # Main application entry point
├── cli.tsx                 # CLI entry point
├── components/             # UI components
│   ├── Initialize.tsx      # Initialization component
│   ├── QueryInterface.tsx  # Main query interface
│   └── Wizard/             # Wizard component for step-by-step flows
│       ├── Steps/          # Individual wizard steps
│       └── Wizard.tsx      # Wizard component implementation
├── contexts/               # React contexts for state management
│   ├── AppContext.tsx      # Application-level state
│   ├── CommandContext.tsx  # Command-related state and functionality
│   ├── ModelContext.tsx    # Model selection and configuration
│   └── QueryContext.tsx    # Query state and history
├── hooks/                  # Custom React hooks
│   ├── useApi.tsx          # Hook for API interactions
│   ├── useKeyboardShortcuts.tsx # Keyboard shortcut handling
│   └── useWizard.tsx       # Hook for wizard functionality
└── utils/                  # Utility functions
    └── config.ts           # Configuration management
```

## Architecture

The application follows a clean architecture with separation of concerns:

1. **Contexts**: Manage global state and provide access to it through hooks
2. **Hooks**: Encapsulate reusable logic and side effects
3. **Components**: UI elements that consume contexts and hooks
4. **Utils**: Pure utility functions

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

- `/clear` - Clear the conversation history
- `/help` - Show help message
- `/model` - Show current model
- `/systemprompt` - Show current system prompt
- `/systemprompt:set <prompt>` - Set system prompt for current model
- `/systemprompt:default <prompt>` - Set default system prompt for current provider
