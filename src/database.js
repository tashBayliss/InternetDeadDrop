// "import" mariadb
const mariadb = require('mariadb');

// make module
module.exports = {
    query
}

// set up db config
const db_config = {
    user: 'tash',
    database: 'sft',
    connectionTimeout: 1000,
    socketPath: '/var/run/mysqld/mysqld.sock',
    connectionLimit: 5
}

// create pool ()
const pool = mariadb.createPool(db_config);

// ask pool for connection, wait for restult then return it
async function query(...req) {
    const conn = await pool.getConnection();
    return conn.query.apply(null, req)
        .catch(err => Promise.reject(new Error("SQL Error: " + err.message)))
        .finally(() => conn.release());
}

