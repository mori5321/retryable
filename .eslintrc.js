module.exports = {
  'env': {
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint',
    'import',
    'unused-imports',
  ],
  'rules': {
    'object-curly-spacing': ['error', 'always'],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external', 
          'internal',
          [
            'parent',
            'sibling'
          ],
          'object',
          'type',
          'index'
        ],
        'newlines-between': 'always',
        'pathGroupsExcludedImportTypes': [
          'builtin'
        ],
        'alphabetize': {
          'order': 'asc', // 昇順にソート
          'caseInsensitive': true // 小文字大文字を区別する 
        },
        'pathGroups': []
      }
    ],
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
      }
    ]
  }
}

