#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const colors = require('colors');

program
	.version('1.0.0')
	.option('-p, --path [path]')
	.option('-n, --name [name]')
	.parse(process.argv);

function isDirectory(path) {
	try {
	const stat = fs.lstatSync(path);
	return stat.isDirectory();
	} catch (err) {
		console.log(`Error checking if path is directory: ${err}`.red);
	}
}

function mapFolder(err, files) {
	if (err) return console.log(`Can't read given path.`.red);

	if (!files.length) return console.log('Given directory is empty.'.yellow);

	createTestDirectory(program.path)
		.then(() => fs.readdir(path.join(COMPONENT_PATH, 'test')))
		.then((existingFiles) => { mapFiles(existingFiles, files); })
		.catch(err => console.log(`Something went wrong: ${err}`.red));
}

function mapFiles(existingTests, components, currentDirectory = '') {
	const filtered = filterComponents(existingTests, components);

	for (let i = 0, len = filtered.length; i < len; i++) {
		const currentComponent = filtered[i];
		const currentPath = path.resolve(COMPONENT_PATH, currentDirectory, currentComponent)

		if (isDirectory(currentPath)) {
			fs.readdir(currentPath)
				.then(files => { mapFiles(existingTests, files, currentComponent); })
		} else if (path.extname(currentComponent) === '.html') {
			createTest(currentComponent);
		}
	}
}

function filterComponents(existing, components) {
	const IGNORED = ['demo', 'index.html', 'test', ...existing];

	return components.filter(c => !IGNORED.includes(c));
}

function createTestIndex(componentPath) {
	return fs.readFile(`${__dirname}${path.sep}index-test-seed.html`, 'utf-8')
		.then(data => fs.writeFile(`${componentPath}${path.sep}test${path.sep}index.html`, data, 'utf-8'))
		.catch(() => console.log(`Can't create index file`.red));
}

function createTest(componentName) {
	return getTestSeed()
		.then(data => data.replace(/{{name}}/g, path.basename(componentName, '.html')))
		.then(processedData =>  fs.writeFile(path.join(COMPONENT_PATH, 'test', componentName), processedData, 'utf-8'))
		.then(() => console.log(`Created test for ${componentName}`.green))
		.catch(() => console.log(`Can't create test for ${componentName}`.red));
}

function createTestDirectory(componentPath) {
	return fs.ensureDir(path.join(componentPath, 'test'));
}

function getTestSeed() {
	return fs.readFile(path.join(__dirname, 'test-suite-seed.html'), 'utf-8')
		.catch(() => console.log(`Can't get test seed.`.red));
}

const COMPONENT_PATH = path.resolve('', program.path);

if (program.path) {
	isDirectory(COMPONENT_PATH) ? fs.readdir(COMPONENT_PATH, mapFolder) : console.log('Provided path is not directory');
} else {
	console.log('You need to provide component path!'.red);
}
