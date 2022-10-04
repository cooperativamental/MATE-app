module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true,
    },
    "extends": "next",
    "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "module",
        "ecmaFeatures": {
          "jsx": true
        }
      },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/no-unescaped-entities": "off",
        "@next/next/no-page-custom-font": "off"
      }
}
