#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const commandLineArgs = require('minimist');
const lodash = require('lodash');

// Retrieve command line arguments
const args = commandLineArgs(process.argv.slice(2));

const MODES = {
  FEATURE_FLAGS: 'featureFlags',
  EXPERIMENTS: 'experiments'
};

// Set the search pattern and directories to exclude
const SEARCH_PATTERN = '**/*.{js,ts,jsx,tsx}';
const EXCLUDED_DIRECTORIES = ['**/test/**', '**/__mocks__/**', '**/node_modules/**'];

// Set the regex patterns for feature flags and experiments
const REGEX_PATTERNS = {
  [MODES.FEATURE_FLAGS]: [/\bf_\w*\b/g, /\bF\w*Feature\b/g],
  [MODES.EXPERIMENTS]: [/\be_\w*\b/g, /\bE\w*Experiment\b/g]
};

const applyTransformation = (flag, mode) => {
  switch(mode) {
    case MODES.FEATURE_FLAGS:
      return flag.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                 .toLowerCase()
                 .replace(/_feature$/, '')
                 .replace(/^far/, 'f_ar')
    case MODES.EXPERIMENTS:
      return flag.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                 .toLowerCase()
                 .replace(/_experiment$/, '')
                 .replace(/^ear/, 'e_ar')
    default:
      return flag;
  }
};

// Function to process a file
const processFile = (filePath, patterns) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let flags = [];
  
  patterns.forEach((pattern) => {
    const matches = fileContent.match(pattern);
    if (matches) {
      flags = [...flags, ...matches];
    }
  });
  
  return flags;
};

// Function to process a directory
const processDirectory = (directoryPath, patterns) => {
  const filePaths = glob.sync(SEARCH_PATTERN, { 
    cwd: directoryPath,
    ignore: EXCLUDED_DIRECTORIES,
    absolute: true 
  });
  
  let flags = [];
  filePaths.forEach((filePath) => {
    flags = [...flags, ...processFile(filePath, patterns)];
  });
  
  return flags;
};

// Main function
const main = () => {
  const directoryPath = args._[0] || '.';
  const mode = args.mode || MODES.FEATURE_FLAGS; // Default mode is featureFlags

  // Validate mode
  if (!Object.values(MODES).includes(mode)) {
    console.error(`Invalid mode! Please select either "${MODES.FEATURE_FLAGS}" or "${MODES.EXPERIMENTS}".`);
    process.exit(1);
  }

  // Process flags
  let flags = processDirectory(directoryPath, REGEX_PATTERNS[mode]);

  // Apply transformations
  flags = flags.map(flag => applyTransformation(flag, mode));

  // Sort and remove duplicates
  flags = lodash.sortBy(lodash.uniq(flags));

  // Display the flags
  console.log(`${mode.charAt(0).toUpperCase() + mode.slice(1)}:`);
  flags.forEach(flag => console.log(flag));
};

main();
