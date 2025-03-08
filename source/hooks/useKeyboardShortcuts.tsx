import {useInput} from 'ink';

interface KeyboardShortcutOptions {
	onEscape?: () => void;
	onTab?: () => void;
	onShiftTab?: () => void;
	onArrowUp?: () => void;
	onArrowDown?: () => void;
	onEnter?: () => void;
	onSlash?: () => void;
	onCtrlC?: () => void;
	onCtrlD?: () => void;
	enabled?: boolean;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutOptions) => {
	const {
		onEscape,
		onTab,
		onShiftTab,
		onArrowUp,
		onArrowDown,
		onEnter,
		onSlash,
		onCtrlC,
		onCtrlD,
		enabled = true,
	} = options;

	useInput(
		(input, key) => {
			if (!enabled) return;

			if (key.escape && onEscape) {
				onEscape();
			}

			if (key.tab && !key.shift && onTab) {
				onTab();
			}

			if (key.tab && key.shift && onShiftTab) {
				onShiftTab();
			}

			if (key.upArrow && onArrowUp) {
				onArrowUp();
			}

			if (key.downArrow && onArrowDown) {
				onArrowDown();
			}

			if (key.return && onEnter) {
				onEnter();
			}

			if (input === '/' && onSlash) {
				onSlash();
			}

			if (key.ctrl && input === 'c' && onCtrlC) {
				onCtrlC();
			}

			if (key.ctrl && input === 'd' && onCtrlD) {
				onCtrlD();
			}
		},
		{isActive: enabled},
	);
};
