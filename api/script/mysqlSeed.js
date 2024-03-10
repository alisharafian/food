const fs = require('fs');
const path = require('path');
const knex = require('knex');
const fse = require('fs-extra');

// Define the path to your SQL file
const sqlFilePath = path.join(__dirname, '../data/strapi_food.sql');

// Read the SQL file
const sqlQueries = fs.readFileSync(sqlFilePath, 'utf-8');

const uploadDataPath = path.join(path.resolve('data'), 'uploads');
const uploadPath = path.join(path.resolve('public'), 'uploads');

const tmpPath = path.resolve('.tmp');

// Configure the database connection
const db = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'strapi_db',
  },
});



async function updateUid() {
  const filePath = `./package.json`;

  try {
    if (fse.existsSync(filePath)) {
      const rawFile = fse.readFileSync(filePath);
      const packageJSON = JSON.parse(rawFile);

      if (packageJSON.strapi.uuid.includes('FOODADVISOR')) return null;

      packageJSON.strapi.uuid =
        `FOODADVISOR-${
          process.env.GITPOD_WORKSPACE_URL ? 'GITPOD-' : 'LOCAL-'
        }` + uuid();

      const data = JSON.stringify(packageJSON, null, 2);
      fse.writeFileSync(filePath, data);
    }
  } catch (e) {
    console.error(e);
  }
}


async function dumpMySQL() {
  // Split the queries using the delimiter (assuming each query ends with ';')
  const queries = sqlQueries.split(';');

  // Remove any empty queries
  const validQueries = queries.filter((query) => query.trim() !== '');

  // Execute each query
  for (const query of validQueries) {
    await db.raw(query);
    console.log(`Query executed: ${query}`);
  }
  console.log('Seed completed successfully.');
  // Disconnect from the database
  await db.destroy();
}


// Function to execute SQL queries
async function sobhanCustom_executeQueries() {
  try {
    await updateUid();
  } catch (error) {
    console.log(error);
  }

  try {
    await fse.emptyDir(tmpPath);
  } catch (err) {
    console.log(`Failed to remove ${tmpPath}`);
  }

  try {
    await dumpMySQL();
  } catch (error) {
    console.error('Error executing seed:', error);
  }

  try {
    await fse.emptyDir(uploadPath);
  } catch (err) {
    console.log(`Failed to remove ${uploadPath}`);
  }

  try {
    await fse.copy(uploadDataPath, uploadPath, { overwrite: true });
  } catch (err) {
    console.log(`Failed to move ${uploadDataPath} to ${uploadPath}`);
  }


}

// Run the seed
sobhanCustom_executeQueries();
