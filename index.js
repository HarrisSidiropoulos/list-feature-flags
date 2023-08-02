#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
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
  const mode = argv.mode || 'featureFlags'; // default mode is featureFlags

  // Validate mode
  if (!['featureFlags', 'experiments'].includes(mode)) {
    console.error('Invalid mode! Please select either "featureFlags" or "experiments".');
    process.exit(1);
  }

  // Process flags
  let flags = processDirectory(dirPath, regexPatterns[mode]);

  // Apply transformations
  flags = flags.map(flag => 
    flag.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(mode === 'featureFlags' ? /_feature$/ : /_experiment$/, '')
        .replace(mode === 'featureFlags' ? /^f/ : /^e/, `_${mode === 'featureFlags' ? 'f' : 'e'}`)
  );

  // sort and remove duplicates
  flags = _.sortBy(_.uniq(flags));

  // output the flags
  console.log(`${mode.charAt(0).toUpperCase() + mode.slice(1)}:`);
  flags.forEach(flag => console.log(flag));
};

main();
