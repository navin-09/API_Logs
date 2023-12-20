const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { pgClient } = require("../helpers/pg");
const statsRouter = require("./stats");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true, methods: ["GET", "POST", "PUT", "DELETE"] }));

app.get("/home", async (req, res) => {
  res.status(200).send("Hello, World!");
});

app.get("/hello_world", async (req, res) => {
  const { user_id } = req.query;

  const requestId = randomUUID();

  // Log request details to the database
  const { method, path, params, body } = req;
  const responseBody = { message: "Hello, World!" };

  // Ensure params and body are defined before stringifying
  const paramsString = params ? JSON.stringify(params) : null;
  const bodyString = body ? JSON.stringify(body) : null;

  // Capture the status code dynamically
  const statusCode = res.statusCode;

  try {
    // Log request details to the database before checking user_id
    await pgClient.query(
      `INSERT INTO api_logs (id, status_code, method, path, params, body, response, user_id)
       VALUES ('${requestId}', ${statusCode}, '${method}', '${path}', '${paramsString}', '${bodyString}', '${JSON.stringify(
        responseBody
      )}', ${user_id || null})`
    );

    // Check if user_id is present, if not, send "auth-failed" response
    if (!user_id) {
      return res.status(400).send("auth-failed");
    }

    // If user_id is present, send the response
    res.json(responseBody);
  } catch (error) {
    console.error("Error inserting into the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(statsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
