import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Mã nguồn chạy trên trình duyệt
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Quy ước import: dùng alias @/ thay cho ../ ; UI không đọc dữ liệu mock trực tiếp
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Dùng alias @/ thay cho đường dẫn ../' },
            { group: ['@/mocks/*'], message: 'Chỉ lớp services/ được đọc dữ liệu mock' },
            {
              group: ['@/client/*', '!@/client/routes'],
              message:
                'Khu admin không dùng code của khu client (chỉ router gốc được gắn clientRoutes)',
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  // Lớp service và chính thư mục mocks được phép đọc dữ liệu mẫu
  {
    files: ['src/services/**', 'src/mocks/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: 'Dùng alias @/ thay cho đường dẫn ../' }] },
      ],
    },
  },
  // Khu client (du khách + đối tác) tách khỏi admin: chỉ dùng chung component cơ bản, cấu hình và tiện ích
  {
    files: ['src/client/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Dùng alias @/ thay cho đường dẫn ../' },
            {
              group: [
                '@/mocks/*',
                '@/pages/*',
                '@/layouts/*',
                '@/contexts/*',
                '@/routes/*',
                '@/constants/*',
                '@/hooks',
                '@/hooks/*',
                '@/types',
                '@/types/*',
                '@/services/*',
                '!@/services/config',
              ],
              message:
                'Khu client không dùng code riêng của admin — chỉ được dùng @/components/common, @/services/config, @/utils và @/client',
            },
          ],
        },
      ],
    },
  },
  // File cấu hình chạy bằng Node
  {
    files: ['*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
