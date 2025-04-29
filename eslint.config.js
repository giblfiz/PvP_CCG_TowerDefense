module.exports = [
  {
    ignores: ['vendors/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Browser globals
        'window': 'readonly',
        'document': 'readonly',
        // Node.js globals
        'process': 'readonly',
        'module': 'readonly',
        'require': 'readonly',
        '__dirname': 'readonly',
        '__filename': 'readonly',
        // Jest globals
        'describe': 'readonly',
        'test': 'readonly',
        'expect': 'readonly',
        'jest': 'readonly',
        'beforeEach': 'readonly',
        'afterEach': 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  }
];