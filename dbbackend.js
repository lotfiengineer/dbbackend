const mysql = require("mysql2");
const http = require("http");
const axios = require("axios");

const PORT = 3001;

// Define MySQL connection settings
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "university",
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the database");
});

const server = http.createServer((req, res) => {
  const professorsSqlQuery = "SELECT * FROM instructor";
  const studentsSqlQuery = "SELECT * FROM student";

  if (req.url === "/professors") {
    if (req.method === "GET") {
      connection.query(professorsSqlQuery, (err, results) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    } else if (req.method === "POST") {
      // code
    }
  }

  if (req.url === "/students") {
    if (req.method === "GET") {
      connection.query(studentsSqlQuery, (err, results) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      });
    }
  }

  // res.writeHead(404, { "Content-Type": "text/plain" });
  // res.end("Not Found");
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
