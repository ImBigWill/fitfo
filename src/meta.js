import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

export const APP_NAME = "FITFO";
export const APP_VERSION = packageJson.version;
export const APP_LICENSE = packageJson.license;
export const APP_PRIVATE = packageJson.private === true;
export const APP_DESCRIPTION = packageJson.description;
