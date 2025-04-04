npm run clean && npm run build
npx typeorm migration:generate src/migration/ApplySnakeNamingAndCreateTables -d dist/plugins/validate/db/data-source.js
npm npm run build
npx typeorm migration:run -d dist/plugins/validate/db/data-source.js
