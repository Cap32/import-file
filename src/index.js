
import interpret from 'interpret';
import rechoir from 'rechoir';
import findUp from 'find-up';
import { resolve } from 'path';
import requireReload from 'require-reload';

const reload = requireReload(require);
const { extensions } = interpret;

const requireResolve = (path) => {
	try { return require.resolve(path); }
	catch (err) { return false; }
};

const resolveFile = function resolveFile(filepath, options = {}) {
	const resolved = requireResolve(filepath);
	if (resolved) { return resolved; }

	const {
		cwd = process.cwd(),
		useLoader = true,
		useFindUp = true,
		resolvers = [],
		exts = [],
	} = options;

	const paths = [];

	if (useLoader) {
		const sortedExts = Object
			.keys(extensions)
			.filter((ext) => !exts.length || exts.indexOf(ext) > -1)
			.sort((a, b) =>
				a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length
			)
		;

		const hasDot = filepath.includes('.');
		const includesExt = () =>
			sortedExts.reverse().some((ext) => filepath.endsWith(ext))
		;

		if (hasDot && includesExt()) {
			paths.push(filepath);
		}
		else {
			paths.push(filepath);
			sortedExts.forEach((ext) => {
				paths.push(filepath + ext);
			});
		}
	}
	else {
		paths.push(filepath);
	}

	const resolverDirs = resolvers.concat('.');
	const fullPaths = [];

	resolverDirs.forEach((dir) => {
		paths.forEach((path) => {
			fullPaths.push(resolve(cwd, dir, path));
		});
	});

	let finalPath = fullPaths.find(requireResolve);

	if (!finalPath && useFindUp) {
		finalPath = findUp.sync(paths, { cwd });
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
		useESDefault = true,
	} = options;
	const finalPath = resolveFile(filepath, options);
	try { useLoader && rechoir.prepare(extensions, finalPath); }
	catch (err) { /* noop */ }
	const module = useCache ? require(finalPath) : reload(finalPath);
	const shouldUseDefault = useESDefault && module.__esModule && module.default;
	return shouldUseDefault ? module.default : module;
};

importFile.resolve = resolveFile;

export default importFile;
