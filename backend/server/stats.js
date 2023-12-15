const { Express } = require("express");
const { pgClient } = require("../helpers/pg");
const router = require("express").Router();

router.get("/api_stats", async (req, res) => {
  console.log("api stats called !");
  const { type, start_time, end_time } = req.query;

  if (!type) return res.status(400).send("type is required");
  if (!start_time) return res.status(400).send("start_time is required");
  if (!end_time) return res.status(400).send("end_time is required");

  let query = ``;

  if (type === "unique_users") {
    query = `
            SELECT 
            COUNT(DISTINCT(user_id)) 
            FROM api_logs 
            WHERE created_at BETWEEN '${start_time}' AND '${end_time}'
        `;
  } else if (type === "total_calls") {
    query = `
                SELECT COUNT(*) FROM api_logs
                WHERE created_at BETWEEN '${start_time}' AND '${end_time}'
            `;
  } else if (type === "total_failures") {
    query = `
                    SELECT COUNT(*) FROM api_logs
                    WHERE status_code != 200 AND created_at BETWEEN '${start_time}' AND '${end_time}'
                `;
  } else if (type === "stats_over_time") {
    query = `
                    WITH api_logs_in_time AS (
                        SELECT * FROM api_logs
                        WHERE created_at BETWEEN '${start_time}' AND '${end_time}'
                    ), no_of_users_over_time AS (
                        SELECT COUNT(DISTINCT user_id) AS no_of_users, TO_CHAR(created_at, 'YYYY-MM-DD') AS date
                        FROM api_logs_in_time
                        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                        ORDER BY date
                    ), no_of_calls_over_time AS (
                        SELECT COUNT(*) AS no_of_calls, TO_CHAR(created_at, 'YYYY-MM-DD') AS date
                        FROM api_logs_in_time
                        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                    ORDER BY date
                ), no_of_failures_over_time AS (
                    SELECT COUNT(*) AS no_of_failures, TO_CHAR(created_at, 'YYYY-MM-DD') AS date
                    FROM api_logs_in_time
                    WHERE status_code >= 400
                    GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                    ORDER BY date
                )
                
                SELECT no_of_users_over_time.date, no_of_users, no_of_calls, no_of_failures
                FROM no_of_users_over_time
                LEFT JOIN no_of_calls_over_time ON no_of_users_over_time.date = no_of_calls_over_time.date
                LEFT JOIN no_of_failures_over_time ON no_of_users_over_time.date = no_of_failures_over_time.date
                ORDER BY no_of_users_over_time.date
                `;
  } else if (type === "query_api_logs") {
    query = `
            SELECT user_id, created_at, status_code, error_code, body, response FROM api_logs
            WHERE created_at BETWEEN '${start_time}' AND '${end_time}'
            ORDER BY created_at DESC
        `;
  } else {
    return res.status(400).send("type is invalid");
  }

  const response = await pgClient.query(query);

  const data = response.rows;

  res.json(data);
});

module.exports = router;
