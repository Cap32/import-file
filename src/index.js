
import interpret from 'interpret';
import rechoir from 'rechoir';
import findUp from 'find-up';
import { resolve } from 'path';
import { existsSync } from 'fs';
import requireReload from 'require-reload';

const reload = requireReload(require);
const { extensions } = interpret;

const resolveFile = function resolveFile(filepath, options = {}) {
	const {
		cwd = process.cwd(),
		useLoader = true,
		useFindUp = true,
	} = options;

	const paths = [];

	if (useLoader) {
		const exts = Object.keys(extensions).sort((a, b) =>
			a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length
		);

		const hasDot = filepath.includes('.');
		const includesExt = () =>
			exts.reverse().some((ext) => filepath.endsWith(ext))
		;

		if (hasDot && includesExt()) {
			paths.push(filepath);
		}
		else {
			paths.push(filepath);
			exts.forEach((ext) => {
				paths.push(filepath + ext);
			});
		}
	}
	else {
		paths.push(filepath);
	}

	let finalPath;

	if (useFindUp) {
		finalPath = findUp.sync(paths, { cwd });
	}
	else {
		finalPath = paths.map((path) => resolve(cwd, path)).find(existsSync);
	}

	if (!finalPath) {
		const error = new Error(`File "${filepath}" NOT found.`);
		error.errno = 'ENOENT';
		throw error;
	}

	return finalPath;
};

const importFile = function importFile(filepath, options = {}) {
	const {
		useLoader = true,
		useCache = true,
	} = options;
	const finalPath = resolveFile(filepath, options);
	try { useLoader && rechoir.prepare(extensions, finalPath); }
	catch (err) { /* noop */ }
	return useCache ? require(finalPath) : reload(finalPath);
};

importFile.resolve = resolveFile;

export default importFile;
