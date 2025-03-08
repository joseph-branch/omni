import {scan} from './scan.js';
import {summarize} from './summarize.js';
import {view} from './view.js';
import {edit} from './edit.js';
import {create} from './create.js';
import {remove} from './remove.js';
import {grep} from './grep.js';
import {bash} from './bash.js';
import {analyzeDependencies} from './analyzeDependencies.js';
import {gitInfo} from './gitInfo.js';

export const tools = {
	scan,
	summarize,
	view,
	edit,
	create,
	remove,
	grep,
	bash,
	analyzeDependencies,
	gitInfo,
};
