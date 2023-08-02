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

// define the regex patterns for feature flags and experiments
const regexPatterns = {
  featureFlags: [/\bf_\w*\b/g, /\bF\w*Feature\b/g],
  experiments: [/\be_\w*\b/g, /\bE\w*Experiment\b/g]
};

// helper function to process a file
const processFile = (filePath, patterns) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let flags = [];
  
  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      flags = flags.concat(matches);
    }
  });
  
  return flags;
};

// helper function to process a directory
const processDirectory = (dirPath, patterns) => {
  const filePaths = glob.sync(searchPattern, { 
    cwd: dirPath,
    ignore: excludeDirs,
    absolute: true 
  });
  
  let flags = [];
  filePaths.forEach((filePath) => {
    flags = flags.concat(processFile(filePath, patterns));
  });
  
  return flags;
};

// main function
const main = () => {
  const dirPath = argv._[0] || '.';

  // Process feature flags
  let featureFlags = processDirectory(dirPath, regexPatterns.featureFlags);
  featureFlags = featureFlags.map(flag => 
    flag.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/^./, '$&_')
        .replace(/_[^_]*$/, '')
        .replace(/^f/, 'f_')
        .replace(/__/g, '')
  );

  // Process experiments
  let experiments = processDirectory(dirPath, regexPatterns.experiments);
  experiments = experiments.map(exp => 
    exp.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
       .toLowerCase()
       .replace(/^./, '$&_')
       .replace(/_[^_]*$/, '')
       .replace(/^e/, 'e_')
       .replace(/__/g, '')
  );

  // sort and remove duplicates
  featureFlags = _.sortBy(_.uniq(featureFlags));
  experiments = _.sortBy(_.uniq(experiments));

  // output the flags
  console.log("Feature Flags:");
  featureFlags.forEach(flag => console.log(flag));

  console.log("\nExperiments:");
  experiments.forEach(exp => console.log(exp));
};

main();
