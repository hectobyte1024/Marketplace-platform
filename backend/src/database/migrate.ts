import initSchema from './schema.js';

const migrate = async () => {
  try {
    console.log('Running migrations...');
    await initSchema();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
