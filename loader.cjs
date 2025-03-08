import {resolve as resolveTs} from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';
import {pathToFileURL} from 'url';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup tsconfig-paths
const {absoluteBaseUrl, paths} = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, context, nextResolve) {
	// Check if the specifier starts with @/
	if (specifier.startsWith('@/')) {
		// Replace @ with the absolute path to the source directory
		const mappedSpecifier = matchPath(specifier);
		if (mappedSpecifier) {
			// Convert the mapped path to a file URL
			return nextResolve(pathToFileURL(mappedSpecifier).href, context);
		}
	}

	// Let ts-node handle the resolution for TypeScript files
	return resolveTs(specifier, context, nextResolve);
}

// Re-export the load function from ts-node
export {load} from 'ts-node/esm';
