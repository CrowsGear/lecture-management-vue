module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module"
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "@vue/eslint-config-prettier/skip-formatting"
  ],
  rules: {
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "@typescript-eslint/semi": ["error", "always"]
  }
}; 