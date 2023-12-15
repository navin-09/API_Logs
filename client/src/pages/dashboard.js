import axios from "axios";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://localhost:8080";

const tableHeaderStyle = {
  backgroundColor: "#f2f2f2",
  color: "#333",
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

export default function Dashboard() {
  const [uniqueUsersCount, setUniqueUsersCount] = useState(0);
  const [noOfApiCals, setNoOfApiCals] = useState(0);
  const [noOfApiFailures, setNoOfApiFailures] = useState(0);
  const [statsOverTimeData, setStatsOverTimeData] = useState([]);
  const [apiLogsData, setApiLogsData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const getLast24Hours = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(now.getHours() - 24);
    setStartDate(yesterday);
    setEndDate(now);
  };

  const getLast7Days = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    setStartDate(sevenDaysAgo);
    setEndDate(now);
  };

  useEffect(() => {
    async function getData() {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const res1 = await axios.get(API_URL + "/api_stats", {
        params: {
          type: "unique_users",
          start_time: formattedStartDate,
          end_time: formattedEndDate,
        },
      });
      setUniqueUsersCount(res1.data[0].count);
      const res2 = await axios.get(API_URL + "/api_stats", {
        params: {
          type: "total_calls",
          start_time: formattedStartDate,
          end_time: formattedEndDate,
        },
      });
      setNoOfApiCals(res2.data[0].count);
      const res3 = await axios.get(API_URL + "/api_stats", {
        params: {
          type: "total_failures",
          start_time: formattedStartDate,
          end_time: formattedEndDate,
        },
      });
      setNoOfApiFailures(res3.data[0].count);
      const res4 = await axios.get(API_URL + "/api_stats", {
        params: {
          type: "stats_over_time",
          start_time: formattedStartDate,
          end_time: formattedEndDate,
        },
      });
      setStatsOverTimeData(res4.data);
      const res5 = await axios.get(API_URL + "/api_stats", {
        params: {
          type: "query_api_logs",
          start_time: formattedStartDate,
          end_time: formattedEndDate,
        },
      });
      setApiLogsData(res5.data);
    }

    getData();
  }, [startDate, endDate]);

  console.log({ statsOverTimeData });

  return (
    <>
      <div>
        <button onClick={getLast24Hours}>Last 24 Hours</button>
        <button onClick={getLast7Days}>Last 7 Days</button>
      </div>

      <p>No of Unique Users: {uniqueUsersCount}</p>
      <p>No of API Calls: {noOfApiCals}</p>
      <p>No of API Failures: {noOfApiFailures}</p>

      <BarChart
        width={800}
        height={300}
        data={statsOverTimeData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="no_of_users" stackId="a" fill="#8884d8" />
        <Bar dataKey="no_of_calls" stackId="a" fill="#82ca9d" />
        <Bar dataKey="no_of_failures" fill="#ffc658" />
      </BarChart>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>User ID</th>
            <th style={tableHeaderStyle}>Created At</th>
            <th style={tableHeaderStyle}>Status Code</th>
            <th style={tableHeaderStyle}>Error Code</th>
            <th style={tableHeaderStyle}>Body</th>
            <th style={tableHeaderStyle}>Response</th>
          </tr>
        </thead>
        <tbody>
          {apiLogsData.map((d, index) => (
            <tr key={index}>
              <td style={tableCellStyle}>{d.user_id}</td>
              <td style={tableCellStyle}>{d.created_at}</td>
              <td style={tableCellStyle}>{d.status_code}</td>
              <td style={tableCellStyle}>{d.error_code}</td>
              <td style={tableCellStyle}>{JSON.stringify(d.body)}</td>
              <td style={tableCellStyle}>{JSON.stringify(d.response)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
