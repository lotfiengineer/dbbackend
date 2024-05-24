const mysql = require("mysql2");
const http = require("http");
const axios = require("axios");

const PORT = 3003;

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
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE",
    "Access-Control-Max-Age": 2592000,
  };

  if (req.url === "/professors") {
    const professorsSqlQuery = "SELECT * FROM instructor";

    if (req.method === "GET") {
      connection.query(professorsSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  if (req.url === "/students") {
    const studentsSqlQuery = "SELECT * FROM student";

    if (req.method === "GET") {
      connection.query(studentsSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }

    if (req.method === "POST") {
      let body = "";

      // Collect data chunks
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const studentId = data.studentId;
          const studentName = data.studentName;
          const departmentName = data.departmentName;
          const totalCredit = data.totalCredit;

          // Insert data into the database
          const query =
            "INSERT INTO student (ID, name, dept_name, tot_cred) VALUES (?, ?, ?, ?)";
          connection.query(
            query,
            [studentId, studentName, departmentName, totalCredit],
            (err, results) => {
              if (err) {
                console.error("Error inserting data into the database:", err);
                res.writeHead(500, headers);
                res.end("Internal Server Error");
                return;
              }

              res.writeHead(201, headers);
              res.end("Data received and inserted");
            }
          );
        } catch (error) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Invalid JSON");
        }
      });
    }
  }

  if (req.url === "/courses") {
    const coursesSqlQuery = "SELECT * FROM course";

    if (req.method === "GET") {
      connection.query(coursesSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  if (req.url === "/departments") {
    const departmentsSqlQuery = "SELECT * FROM department";

    if (req.method === "GET") {
      connection.query(departmentsSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  // res.writeHead(404, headers);
  // res.end("Not Found");
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
