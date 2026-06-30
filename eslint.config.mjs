import nextPlugin from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextPlugin,
  {
    ignores: [
      ".next/**",
      "src/generated/**",
      "node_modules/**",
      "prisma/migrations/**",
    ],
  },
];

export default eslintConfig;
