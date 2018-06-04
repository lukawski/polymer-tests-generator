#!/usr/bin/env node
const globby = require('globby');
const path = require('path');
const program = require('commander');
const colors = require('colors');
const fs = require('fs-extra');

program
  .version('1.0.0')
  .option('-p, --path [path]')
  .parse(process.argv);

const COMPONENT_PATH = path.resolve('', program.path);

const OPTIONS = {
  gitignore: true,
  cwd: COMPONENT_PATH,
};

const makeListUnique = list => [...new Set(list)];

const createTestIndex = (componentPath) => {
  const indexPath = path.join(componentPath, 'test', 'index.html');
  let seedData;
  let originalData;
  return fs.readFile(path.join(__dirname, 'index-test-seed.html'), 'utf-8')
    .then((data) => {
      seedData = data;
      return fs.readFile(indexPath, 'utf-8');
    })
    .then((data) => {
      console.log('Index file already exists'.green);
      originalData = data;
      return Promise.resolve(true);
    })
    .catch(() => fs.writeFile(indexPath, seedData))
    .then((exists) => {
      if (!exists) console.log('Created index file'.green);
      return originalData || seedData;
    })
    .catch(() => console.log('Can\'t create index file'.red));
};

const updateSuitsList = components =>
  createTestIndex(COMPONENT_PATH)
    .then((data) => {
      const [match] = data.match(/(\(\[)([^]*)(\]\))/);
      const list = match.slice(2, match.length - 2);
      const updatedList = [...list.split(','), ...components]
        .filter(component => Boolean(component.trim()))
        .map(component => (component.startsWith("'") ? component : `'${component}'`));
      const uniqueList = makeListUnique(updatedList).join(',');
      const updatedData = data.replace(match, `([${uniqueList}])`);
      return fs.writeFile(path.join(COMPONENT_PATH, 'test', 'index.html'), updatedData);
    });

const getTestSeed = () => fs
  .readFile(path.join(__dirname, 'test-suite-seed.html'), 'utf-8')
  .catch(() => console.log('Can\'t get test seed.'.red));

const createTest = (componentName, testSeed, compPath) => {
  const processedSeed = testSeed
    .replace(/{{name}}/g, path.basename(componentName, '.html'))
    .replace(/{{importPath}}/g, path.relative('test', compPath));

  return fs.writeFile(path.join(COMPONENT_PATH, 'test', componentName), processedSeed, 'utf-8')
    .then(() => console.log(`Created test for ${componentName}`.green))
    .catch(err => console.log(`Can't create test for ${componentName}. ${err}`.red));
};

const createTestDirectory = componentPath => fs.ensureDir(path.join(componentPath, 'test'));

const filterExisting = (files, existingTests) =>
  files.filter(file => !existingTests.includes(file));

const flatten = files => files.map(file => path.basename(file));

const findComponentPath = (compName, paths = []) =>
  paths.find(compPath => compPath.includes(compName));

const generateTests = ([files = [], existingTests = []] = []) => {
  const components = filterExisting(flatten(files), flatten(existingTests));

  return createTestDirectory(COMPONENT_PATH)
    .then(() => getTestSeed())
    .then(seed => Promise.all([
      updateSuitsList(components),
      ...components.map(component => createTest(component, seed, findComponentPath(component, files))),
    ]));
};

if (program.path) {
  const globbyPromises = [
    globby(['**/*.html', '!demo', '!index.html', '!test'], OPTIONS),
    globby(['test/*.html', '!index.html'], OPTIONS),
  ];

  Promise.all(globbyPromises)
    .then(generateTests)
    .then(() => console.log('🎉 🎉 🎉   Done. 🔥 🔥 🔥'.bold.underline.green))
    .catch(err => console.log(`Something went wrong. ${err}`.red));
} else {
  console.log('You need to provide component path!'.red);
}

