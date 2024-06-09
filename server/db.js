// import pg and create client

const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_reservation_db"
);

// import uuid

const uuid = require("uuid");

// query tables
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations CASCADE;
    DROP TABLE IF EXISTS restaurant CASCADE;
    DROP TABLE IF EXISTS customer CASCADE;

    CREATE TABLE customer(
      id UUID PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE restaurant(
      id UUID PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE reservations(
      id UUID PRIMARY KEY,
      reservation_date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      customer_id UUID REFERENCES customer(id) NOT NULL,
      restaurant_id UUID REFERENCES restaurant(id) NOT NULL
    );
  `;
  await client.query(SQL);
};

// CRUD SECTION

// createCustomer
const createCustomer = async ({ name }) => {
  const SQL = `
    INSERT INTO customer (id, name) 
    VALUES ($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

// createRestaurant
const createRestaurant = async ({ name }) => {
  const SQL = `
    INSERT INTO restaurant (id, name)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

// createReservation
const createReservation = async ({
  customer_id,
  restaurant_id,
  reservation_date,
  party_count,
}) => {
  const SQL = `
    INSERT INTO reservations (id, customer_id, restaurant_id, reservation_date, party_count)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    customer_id,
    restaurant_id,
    reservation_date,
    party_count,
  ]);
  return response.rows[0];
};

// fetchCustomers
const fetchCustomers = async () => {
  const SQL = `
    SELECT * 
    FROM customer;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// fetchRestaurants
const fetchRestaurants = async () => {
  const SQL = `
    SELECT * 
    FROM restaurant;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// fetchReservations
const fetchReservations = async () => {
  const SQL = `
    SELECT * 
    FROM reservations;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// destroyReservation
const destroyReservation = async ({ id, customer_id }) => {
  const SQL = `
    DELETE FROM reservations
    WHERE id = $1 AND customer_id = $2;
  `;
  return await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
};
