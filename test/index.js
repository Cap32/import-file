import importFile from '../src';
import assert from 'assert';
import { join, basename } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { cleanup } from './utils';

const options = { cwd: __dirname };
const random = () =>
	Math.random()
		.toString(36)
		.slice(2);

describe('importFile()', () => {
	afterEach(cleanup);

	it('import from `node_modules`', () => {
		const rimraf = importFile('rimraf'); // from `node_modules`
		assert(typeof rimraf === 'function');
	});

	it('.js', () => {
		const result = importFile('javascript', options);
		assert.strictEqual(result, 'works');
	});

	it('.yaml', () => {
		const result = importFile('yaml', options).yaml;
		assert.strictEqual(result, 'works');
	});

	it('with extname', () => {
		const result = importFile('yaml.yaml', options).yaml;
		assert.strictEqual(result, 'works');
	});

	it('with `useFindUp`', () => {
		const result = importFile('javascript', {
			cwd: join(__dirname, 'fake', 'dir'),
		});
		assert.strictEqual(result, 'works');
	});

	it('without `useFindUp`', () => {
		assert.throws(() => {
			importFile('javascript', {
				cwd: join(__dirname, 'fake', 'dir'),
				useFindUp: false,
			});
		});
	});

	it('without `useLoader`', () => {
		assert.throws(() => {
			importFile('yaml.yaml', {
				...options,
				useLoader: false,
			});
		});
	});

	it('with `useCache`', () => {
		const name = `${random()}.json`;
		const content = 'cache';
		const updated = 'update';
		const tmpFilename = join(__dirname, name);
		const write = (filename, data) =>
			writeFileSync(filename, JSON.stringify(data), 'utf-8');
		write(tmpFilename, content);
		const result = importFile(name, options);
		write(tmpFilename, updated);
		const cachedResult = importFile(name, options);
		unlinkSync(tmpFilename);
		assert.strictEqual(result, content);
		assert.strictEqual(cachedResult, content);
	});

	it('with `useESDefault`', () => {
		const result = importFile('es', options);
		assert.strictEqual(result, 'works');
	});

	it('with `resolvers`', () => {
		const result = importFile('resolvers', {
			...options,
			resolvers: ['other'],
		});
		assert.strictEqual(result, 'works, too');
	});

	it('without `useCache`', () => {
		const name = `${random()}.json`;
		const content = 'cache';
		const updated = 'update';
		const tmpFilename = join(__dirname, name);
		const write = (filename, data) =>
			writeFileSync(filename, JSON.stringify(data), 'utf-8');
		write(tmpFilename, content);
		const result = importFile(name, options);
		write(tmpFilename, updated);
		const cachedResult = importFile(name, {
			...options,
			useCache: false,
		});
		unlinkSync(tmpFilename);
		assert.strictEqual(result, content);
		assert.notStrictEqual(cachedResult, content);
	});

	it('without extname and without `useLoader`', () => {
		const result = importFile('javascript', {
			...options,
			useLoader: false,
		});
		assert.strictEqual(result, 'works');
	});

	it('with `exts`', () => {
		assert.throws(() =>
			importFile('yaml', {
				...options,
				exts: ['.js'], // there is no `yaml.js`, so throws error.
			}),
		);
	});

	it('index.js', () => {
		const result = importFile('index', {
			cwd: join(__dirname, 'other'),
		});
		assert.strictEqual(result, 'works');
	});
});

describe('importFile.resolve()', () => {
	it('resolved', () => {
		const path = importFile.resolve('javascript', options);
		assert.strictEqual(basename(path, '.js'), 'javascript');
	});

	it('ENOENT', () => {
		assert.throws(() => importFile.resolve('not-found', options));
	});
});
