// database imports

const {
  client,
  createTables,
  createCustomer,
  createReservation,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
} = require("./db");

// import express and store in app

const express = require("express");
const app = express();

// req body json parsing middleware

app.use(express.json());

// init function

const init = async () => {
  // connect client to the database

  console.log("connecting to the database...");
  await client.connect();
  console.log("connected to the database");

  //  invoke the created table
  await createTables();
  console.log("<------ TABLES ------>");

  // promise

  const [sammy, toni, bill, ola, veggieBar, classicGrill] = await Promise.all([
    // create four customers

    createCustomer({ name: "sammy" }),
    createCustomer({ name: "toni" }),
    createCustomer({ name: "bill" }),
    createCustomer({ name: "ola" }),

    // create four restaurants

    createRestaurant({ name: "veggieBar" }),
    createRestaurant({ name: "classicGrill" }),
  ]);

  //  create three reservations

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: sammy.id,
      restaurant_id: veggieBar.id,
      party_count: 3,
      reservation_date: "07/09/2024",
    }),
    createReservation({
      customer_id: bill.id,
      restaurant_id: classicGrill.id,
      party_count: 7,
      reservation_date: "07/12/2024",
    }),
  ]);

  console.log("---customers---");
  console.log(await fetchCustomers());
  console.log("---restaurants---");
  console.log(await fetchRestaurants());

  // invoke reservation destroyer

  //   await destroyReservation({
  //     id: reservation.id,
  //     customer_id: reservation.customer_id,
  //   });

  console.log("---reservations---");
  console.log(await fetchReservations());
  // create a port and listener & log test routes using curl

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
    console.log(`---TEST ROUTES---`);
    console.log(`GET / localhost:${port}/api/customers`);
    console.log(` GET / localhost:${port}/api/restaurants`);
    console.log(` GET / localhost:${port}/api/reservations`);
    console.log(` POST / localhost:${port}/api/customers/:id/reservations`);
    console.log(
      ` DELETE / localhost:${port}/api/customers/:customer_id/reservations/:id`
    );
  });
};

// invoke init

init();

// EXPRESS ROUTES

// readCustomers

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

// readRestaurants

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

// readReservations

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

// deleteReservation

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        id: req.params.id,
        customer_id: req.params.customer_id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error, () => console.log(fetchReservations()));
    }
  }
);

// createResevation

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.id,
        restaurant_id: req.body.restaurant_id,
        party_count: req.body.party_count,
        reservation_date: req.body.reservation_date,
      })
    );
  } catch (error) {
    next(error);
  }
});
