
import interpret from 'interpret';
import rechoir from 'rechoir';
import findUp from 'find-up';
import { resolve, extname } from 'path';
import requireReload from 'require-reload';

const reload = requireReload(require);
const { extensions } = interpret;

const resolveFile = function resolveFile(filepath, options = {}) {
	const {
		cwd = process.cwd(),
		useLoader = true,
		useFindUp = true,
		resolvers = [],
		exts = [],
	} = options;

	const uniqueResolvers = Array.from(new Set([cwd, ...resolvers]));
	const resolverPaths = uniqueResolvers.map((path) => resolve(cwd, path));

	const requireResolve = (path) => {
		try { return require.resolve(path, { paths: resolverPaths }); }
		catch (err) { return false; }
	};

	const resolved = requireResolve(filepath);

	if (resolved) { return resolved; }

	const paths = [];

	if (useLoader) {
		const sortedExts = Object
			.keys(extensions)
			.filter((ext) => !exts.length || exts.indexOf(ext) > -1)
			.sort((a, b) =>
				a === '.js' ? -1 : b === '.js' ? 1 : a.length - b.length
			)
		;

		const fileExt = extname(filepath);
		const includesExt = () =>
			sortedExts.reverse().some((ext) => filepath.endsWith(ext))
		;

		if (fileExt && includesExt()) {
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

	const fullPaths = [];
	resolverPaths.forEach((dir) => {
		paths.forEach((path) => {
			fullPaths.push(resolve(cwd, dir, path));
		});
	});

	let finalPath = fullPaths.find(requireResolve);

	if (!finalPath && useFindUp) {
		finalPath = findUp.sync(paths, { cwd });
	}

	if (!finalPath) {
		const error = new Error(`Module "${filepath}" NOT found.`);
		error.errno = 'ENOENT';
		error.cwd = cwd;
		error.paths = fullPaths;
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
