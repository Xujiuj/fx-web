import next from "eslint-config-next";

const config = [
  ...next,
  {
    ignores: [".playwright-cli/**", "output/**"],
  },
];

export default config;
