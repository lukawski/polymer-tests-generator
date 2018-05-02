#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const colors = require('colors');

program
	.version('1.0.0')
	.option('-p, --path [path]')
	.option('-n, --name [name]')
	.parse(process.argv);

function isDirectory(path) {
	const stat = fs.lstatSync(path);
	return stat.isDirectory();
}

function mapFolder(err, files) {
	if (err) return console.log(`Can't read given path.`.red);

	if (!files.length) return console.log('Given directory is empty.'.yellow);

	createTestDirectory(program.path);
	createTestIndex(componentPath);


	for (let i = 0, len = files.length; i < len; i++) {
		const currentPath = `${componentPath}${path.sep}${files[i]}`;

		if (isDirectory(currentPath)) {
			fs.readdir(currentPath, mapFolder);
		} else {
			createTest(files[i]);
		}
	}
}

function mapFiles(files) {

}

function createTestIndex(componentPath) {
	fs.readFile(`${__dirname}${path.sep}index-test-seed.html`, 'utf-8', (err, data) => {
		fs.writeFile(`${componentPath}${path.sep}test${path.sep}index.html`, data, 'utf-8', (err) => {
			if (err) console.log(`Can't create index file`.red);
		});
	});
}

function createTest(componentName) {
	fs.readFile(`${__dirname}${path.sep}test-suite-seed.html`, 'utf-8', (err, data) => {
		fs.writeFile(`${componentPath}${path.sep}test${path.sep}${componentName}`, data, 'utf-8', (err) => {
			if (err) console.log(`Can't create test for ${componentName}`.red);
		});
	});
}

function createTestDirectory(componentPath) {
	fs.mkdirSync(`${componentPath}${path.sep}test`);
}

function getTestSeed() {

}

const componentPath = `${process.cwd()}${path.sep}${program.path}`;

if (program.path) {
	isDirectory(componentPath) ? fs.readdir(componentPath, mapFolder) : console.log('Provided path is not directory');
} else {
	console.log('You need to provide component path!'.red);
}
