module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    '@nuxtjs',
    "plugin:vue/recommended",
    "eslint:recommended",
    'prettier',
    "prettier/vue",
    "plugin:prettier/recommended",
    'plugin:nuxt/recommended'
  ],
  rules: { 
    "vue/no-template-shadow": process.env.NODE_ENV === "production" ? "error" : "off", 
    "vue/order-in-components": process.env.NODE_ENV === "production" ? "error" : "off", 
    "vue/no-v-html": process.env.NODE_ENV === "production" ? "error" : "off", 
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    'no-eval': ["error", {
      allowIndirect: true
    }]
  },
  globals: {
    $nuxt: true
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};