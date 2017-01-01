# import-file

  Import the closest file with loader.

## What is it

Say you're writing a CLI tool. You may want the following features:

- Get the closest configure file
- Automatically register module loader according to extension name

`import-file` manages these for you.

## Example

###### /project/my_config.babel.js

```js
export default {
    name: 'awesome',
};
```

###### /project/src/index.js

```js
import importFile from 'import-file';

const config = importFile('my_config.babel.js');
console.log(config.name);
```

```bash
$ cd /project/src && node index
# => `awesome`
```

## Usage

#### importFile(filepath[, options])

Import a file as a node module. Return a node module if the file exists, otherwise throw an error.

###### Arguments

1. `filepath` (String): Target file path. If not provide a extension name, it will automatically add extension and register module loader. For more detail of extensions and modules, please read [interpret](https://github.com/js-cli/js-interpret).
2. `options` (Object): These are all the available options.
    - `cwd` (String): The directory resolves from. Defaults to `process.cwd()`
    - `useLoader` (Boolean): Enable automatically register module loader according to the adding extension name. Defaults to `true`
    - `useFindUp` (Boolean): Find by walking up parent directories. Defaults to `true`

---

#### importFile.resolve(filepath[, options])

All arguments and usage is the same with `importFile()`, but just return the resolved filename. Throw an error if the file is not exists.

## Installing

```bash
$ npm install import-file
```

## License

MIT
