// eslint.config.js

import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ['*.svelte'],
        plugins: {
            svelte: svelte,
        },
        languageOptions: {
            parser: svelte.parser,
        },
        rules: {
            ...svelte.configs.recommended.rules,
        },
    },
    prettier,
];
