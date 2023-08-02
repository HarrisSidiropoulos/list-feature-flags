# list-feature-flags

`list-feature-flags` is a command-line utility that searches through JavaScript and TypeScript files in a directory for feature flags and experiment keys, and outputs a sorted, unique list of them.

## Installation

You can use this utility via `npx` without installing it:

```
npx list-feature-flags
```

Or, install it globally using `npm`:

```
npm install -g list-feature-flags
```

## Usage

To use the utility, navigate to the directory containing your JavaScript or TypeScript files and run:

```
npx list-feature-flags --mode=featureFlags
```

Or, if you installed it globally:

```
list-feature-flags --mode=experiments
```

The utility allows two modes:

1. `featureFlags`: This mode will search for any words matching the regular expressions `\bf_\w*\b` and `\bF\w*Feature\b`, then applies a series of transformations to convert CamelCase to snake_case, lowercasing the string, removing the trailing `_feature` part and finally ensuring the flag starts with `_f`.

2. `experiments`: This mode will search for any words matching the regular expressions `\be_\w*\b` and `\bE\w*Experiment\b`, then applies a similar series of transformations as in `featureFlags` mode, but removes the trailing `_experiment` part and ensures the flag starts with `_e`.

In both modes, files in `test`, `__mocks__`, and `node_modules` directories are excluded from the search. The output lists are sorted and duplicates are removed.

If the `--mode` flag is not provided, the utility defaults to `featureFlags`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC

---
