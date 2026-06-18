const js = require("@eslint/js");
const globals = require("globals");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-var-requires": "off",
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["dist", "build", "node_modules", "src/imports/unused"],
  },
];
