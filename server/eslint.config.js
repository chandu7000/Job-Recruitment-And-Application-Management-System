import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "uploads/**",
      "src/migrations/**",
      "src/seeders/**"
    ]
  },

  js.configs.recommended,

  {
    files: ["src/**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },

    rules: {
      "no-console": "off",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  },

  {
    files: ["src/**/*.cjs"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    },

    rules: {
      "no-console": "off"
    }
  },

  {
    files: ["src/tests/**/*.js"],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  }
];