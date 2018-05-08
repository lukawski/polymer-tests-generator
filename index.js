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

function isDirectory(pathToCheck) {
  return fs.lstat(pathToCheck)
    .then((stat) => { stat.isDirectory(); });
}

function getTestSeed() {
  return fs.readFile(path.join(__dirname, 'test-suite-seed.html'), 'utf-8')
    .catch(() => console.log('Can\'t get test seed.'.red));
}

function createTestIndex(componentPath) {
  const indexPath = path.join(componentPath, 'test', 'index.html');
  let seedData;
  return fs.readFile(path.join(__dirname, 'index-test-seed.html'), 'utf-8')
    .then((data) => {
      seedData = data;
      return fs.readFile(indexPath, 'utf-8');
    })
    .then(() => { console.log('Index file already exists'.green); })
    .catch(() => fs.writeFile(indexPath, seedData))
    .then(() => console.log('Created index file'.green))
    .catch(() => console.log('Can\'t create index file'.red));
}

function createTestDirectory(componentPath) {
  return fs.ensureDir(path.join(componentPath, 'test'))
    .then(() => createTestIndex(componentPath));
}


function filterComponents(existing, components) {
  const IGNORED = ['demo', 'index.html', 'test', ...existing];

  return components.filter(c => !IGNORED.includes(c));
}

// function updateSuitesList(componentName) {
//   return fs.readFile(path.join(__dirname, 'index-test-seed.html'), 'utf-8')
//     .then((data) => {
//       const [match] = data.match(/(\(\[)([^]*)(\]\))/);
//       const list = match.slice(2, match.length - 2);
//       console.log('list', list);
//       return true;
//     });
// }

function createTest(componentName) {
  return getTestSeed()
    .then(data => data.replace(/{{name}}/g, path.basename(componentName, '.html')))
    .then(processedData => fs.writeFile(path.join(COMPONENT_PATH, 'test', componentName), processedData, 'utf-8'))
    .then(() => updateSuitesList(componentName))
    .then(() => console.log(`Created test for ${componentName}`.green))
    .catch(err => console.log(`Can't create test for ${componentName}. ${err}`.red));
}

function mapFiles(existingTests, components, currentDirectory = '') {
  const filtered = filterComponents(existingTests, components);

  for (let i = 0, len = filtered.length; i < len; i++) {
    const currentComponent = filtered[i];
    const currentPath = path.resolve(COMPONENT_PATH, currentDirectory, currentComponent);

    isDirectory(currentPath)
      .then(() => fs.readdir(currentPath))
      .then((files) => {
        mapFiles(existingTests, files, path.join(currentDirectory, currentComponent)); 
      })
      .catch(() => {
        if (path.extname(currentComponent) === '.html') {
          createTest(currentComponent);
        }
      });
  }
}

function mapFolder(err, files) {
  if (err) return console.log('Can\'t read given path.'.red);

  if (!files.length) return console.log('Given directory is empty.'.yellow);

  return createTestDirectory(program.path)
    .then(() => fs.readdir(path.join(COMPONENT_PATH, 'test')))
    .then((existingFiles) => { mapFiles(existingFiles, files); })
    .catch(createErr => console.log(`Something went wrong: ${createErr}`.red));
}

const COMPONENT_PATH = path.resolve('', program.path);

if (program.path) {
  if (isDirectory(COMPONENT_PATH)) fs.readdir(COMPONENT_PATH, mapFolder);
  else console.log('Provided path is not directory');
} else {
  console.log('You need to provide component path!'.red);
}
