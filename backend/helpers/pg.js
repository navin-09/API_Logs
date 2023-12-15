const pg = require("pg");
const dotenv = require("dotenv").config();

pg.types.setTypeParser(20, parseInt);

const DATABASE_URL = process.env.DATABASE_URL;

exports.pgClient = new pg.Pool({ connectionString: DATABASE_URL });
