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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // DELETE a student
  if (req.method === "OPTIONS") {
    req.method = "DELETE";

    const id = req.url.split("/").pop();

    // Delete data from the database
    const query = "DELETE FROM student WHERE ID = ?";
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error deleting data from the database:", err);
        res.writeHead(500, headers);
        res.end("Internal Server Error");
        return;
      }

      if (results.affectedRows === 0) {
        res.writeHead(404, headers);
        res.end("Student not found");
      } else {
        res.writeHead(200, headers);
        res.end("Student deleted");
      }
    });
  }

  // *** Professors Methods ***
  if (req.url === "/professors") {
    const professorsSqlQuery = "SELECT * FROM instructor";

    if (req.method === "GET") {
      connection.query(professorsSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  // *** Students Methods ***
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
          res.writeHead(400, headers);
          res.end("Invalid JSON");
        }
      });
    }
  }

  // *** Courses Methods ***
  if (req.url === "/courses") {
    const coursesSqlQuery = "SELECT * FROM course";

    if (req.method === "GET") {
      connection.query(coursesSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  // *** Departments Methods ***
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
