# list-feature-flags

`list-feature-flags` is a command line utility that searches through JavaScript and TypeScript files in a directory for feature flags and experiment keys, and outputs a sorted, unique list of them.

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
npx list-feature-flags
```

Or, if you installed it globally:

```
list-feature-flags
```

This will search for any words matching the following regular expressions:

- For feature flags: `\bf_\w*\b` and `\bF\w*Feature\b`
- For experiments: `\be_\w*\b` and `\bE\w*Experiment\b`

Files in `test`, `__mocks__`, and `node_modules` directories are excluded from the search.

The utility outputs two separate lists:

1. Feature Flags: The output list is generated by applying a series of transformations to the matched flags. CamelCase is converted to snake_case, the string is converted to lowercase, an underscore is prepended to the start, the trailing portion after the last underscore is removed, the prefix "f" is replaced with "f_", and double underscores are replaced with a single underscore.

2. Experiments: Similar transformations are applied as in feature flags, but the prefix "e" is replaced with "e_".

The lists are sorted and duplicates are removed.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC

---

