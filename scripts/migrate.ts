import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('🔄 Running migrations...');

  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migrations completed successfully!');

  await migrationClient.end();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
