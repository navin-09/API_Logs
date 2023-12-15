const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { pgClient } = require("../../../helpers/pg");
const statsRouter = require("./stats");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true, methods: ["GET", "POST", "PUT", "DELETE"] }));

app.get("/home", async (req, res) => {
  res.status(200).send("Hello, World!");
});

app.get("/log_request", async (req, res) => {
  console.log("--came");
  const { user_id } = req.query;

  if (!user_id) return res.status(400).send("auth-failed");

  const requestId = randomUUID();

  // Log request details to the database
  await pgClient.query(
    `INSERT INTO api_logs (id, status_code, method, path, params, body, response, user_id)
     VALUES ('${requestId}', 200, 'GET', '/log_request', '{}', '{}', '{"message": "Hello, World!"}', ${user_id})`
  );

  res.json({ message: "Hello, World!" });
});
app.use(statsRouter);
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
