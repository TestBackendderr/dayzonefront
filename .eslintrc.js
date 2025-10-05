module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Отключаем все ESLint правила в production
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': 'off',
    'no-debugger': 'off'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};
