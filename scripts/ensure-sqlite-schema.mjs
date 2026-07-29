import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const [databasePath, schemaPath] = process.argv.slice(2);

if (!databasePath || !schemaPath) {
  throw new Error("Usage: ensure-sqlite-schema <database-path> <schema-path>");
}

const database = new DatabaseSync(databasePath);

try {
  database.exec(readFileSync(schemaPath, "utf8"));
} finally {
  database.close();
}
