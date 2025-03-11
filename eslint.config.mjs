import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow the use of 'any' type
      "@typescript-eslint/no-explicit-any": "off",
      
      // Allow unused variables (prefixing with _ is still recommended for clarity)
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      
      // Allow empty functions
      "@typescript-eslint/no-empty-function": "off",
      
      // Allow non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
];

export default eslintConfig;
