#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob2');
const minimist = require('minimist');
const _ = require('lodash');

// get command line arguments
const argv = minimist(process.argv.slice(2));

// define the search pattern and exclude directories
const searchPattern = '**/*.{js,ts,jsx,tsx}';
const excludeDirs = ['**/test/**', '**/__mocks__/**', '**/node_modules/**'];

// define the regex patterns for feature flags
const regexPatterns = [
  /\bf_\w*\b/g, 
  /\bF\w*Feature\b/g
];

// helper function to process a file
const processFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let flags = [];
  
  regexPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      flags = flags.concat(matches);
    }
  });
  
  return flags;
};

// helper function to process a directory
const processDirectory = (dirPath) => {
  const filePaths = glob.sync(searchPattern, { 
    cwd: dirPath,
    ignore: excludeDirs,
    absolute: true 
  });
  
  let flags = [];
  filePaths.forEach((filePath) => {
    flags = flags.concat(processFile(filePath));
  });
  
  return flags;
};

// main function
const main = () => {
  const dirPath = argv._[0] || '.';
  let flags = processDirectory(dirPath);

  // apply transformations to flag names
  flags = flags.map(flag => 
    flag.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/^./, '$&_')
        .replace(/_[^_]*$/, '')
        .replace(/__/g, '')
        .replace(/^far_/, 'f_ar_')
  );

  // sort and remove duplicates
  flags = _.sortBy(_.uniq(flags));

  // output the flags
  flags.forEach(flag => console.log(flag));
};

main();
