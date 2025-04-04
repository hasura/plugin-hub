// src/data-source.ts

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url'; // Import necessary function from 'url'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import path from "path";

// --- Calculate current directory using import.meta.url ---
// Note: This will resolve differently depending on whether you run the .ts (via ts-node)
// or the compiled .js file. We assume running the compiled .js file for migrations.
// When this file is compiled to dist/plugins/validate/db/data-source.js,
// currentDir will point to that directory.
const currentDir = path.dirname(fileURLToPath(import.meta.url));
// ----------------------------------------------------------

dotenv.config();

// --- Default values --- (keep as before)
const defaultHost = 'localhost';
const defaultPort = 5432;
const defaultUsername = 'postgres';
const defaultPassword = 'password';
const defaultDatabase = 'postgres';
const defaultSchema = 'data_quality';
const defaultType = 'postgres';

export const AppDataSource = new DataSource({
    type: (process.env.DB_TYPE || defaultType) as any,
    host: process.env.DB_HOST || defaultHost,
    port: parseInt(process.env.DB_PORT || `${defaultPort}`, 10),
    username: process.env.DB_USER || defaultUsername,
    password: process.env.DB_PASSWORD || defaultPassword,
    database: process.env.DB_NAME || defaultDatabase,

    // --- Specify the schema here ---
    schema: process.env.DB_SCHEMA || defaultSchema,
    // --------------------------------

    synchronize: false, // Keep false for migrations
    logging: process.env.NODE_ENV === 'development' || true,
    namingStrategy: new SnakeNamingStrategy(),

    entities: [
        // Use path.join with the calculated currentDir
        path.join(currentDir, '../**/*.entity{.js,.ts}') // Goes up one level from 'db' to 'validate'
    ],
    migrations: [
        // Use path.join with the calculated currentDir
        path.join(currentDir, '../../../migration/**/*{.js,.ts}') // Goes up two levels from 'db' to 'plugins', then to 'migration'
    ],

    // Set the migrations table schema if you want migrations table itself in that schema
    migrationsTableName: "typeorm_migrations", // Default name
    migrationsTransactionMode: "each", // Recommended

    subscribers: []
});


