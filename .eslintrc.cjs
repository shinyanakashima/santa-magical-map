// .eslintrc.cjs

module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:svelte/recommended',
        'prettier'
    ],
    overrides: [
        {
            files: ['*.svelte'],
            processor: 'svelte/svelte'
        }
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    plugins: ['svelte'],
    rules: {
        // 必要ならルールを追加
    }
};
