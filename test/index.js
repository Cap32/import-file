
import importFile from '../src';
import assert from 'assert';
import { join, basename } from 'path';

const options = { cwd: __dirname };

describe('importFile()', () => {
	it('.js', () => {
		const result = importFile('javascript', options);
		assert.equal(result, 'works');
	});

	it('.yaml', () => {
		const result = importFile('yaml', options).yaml;
		assert.equal(result, 'works');
	});

	it('with extname', () => {
		const result = importFile('yaml.yaml', options).yaml;
		assert.equal(result, 'works');
	});

	it('with `useFindUp`', () => {
		const result = importFile('javascript', {
			cwd: join(__dirname, 'fake', 'dir'),
		});
		assert.equal(result, 'works');
	});

	it('without `useFindUp`', () => {
		assert.throws(() => {
			importFile('javascript', {
				cwd: join(__dirname, 'fake', 'dir'),
				useFindUp: false,
			});
		});
	});
});

describe('importFile.resolve()', () => {
	it('resolved', () => {
		const path = importFile.resolve('javascript', options);
		assert.equal(basename(path, '.js'), 'javascript');
	});

	it('ENOENT', () => {
		assert.throws(() => importFile.resolve('not-found', options));
	});
});
