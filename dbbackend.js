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

  if (req.url.startsWith("/studentsOfProfessors/")) {
    const id = req.url.split("/").pop();

    const studentsOfProfessorsSqlQuery =
      `select instructorId, instructorName, studentId, studentName, title from (SELECT * FROM (SELECT instructor.ID as instructorId, course_ID as insCourseId, name as instructorName, dept_name FROM teaches INNER JOIN instructor on teaches.ID = instructor.ID) as ins INNER JOIN (SELECT student.ID as studentId, takes.course_id, student.name as studentName, takes.grade FROM student INNER JOIN takes on student.ID = takes.ID) as std on ins.insCourseId = std.course_id) as temp inner join course on temp.course_ID = course.course_ID where instructorId=${id}`;

    if (req.method === "GET") {
      connection.query(studentsOfProfessorsSqlQuery, (err, results) => {
        res.writeHead(200, headers);
        res.end(JSON.stringify(results));
      });
    }
  }

  // gives back the grade of all the students
  // if (req.url === "/studentsWithGrade") {
  //   const studentsWithGradeSqlQuery =
  //     "select * from (select student.ID, student.name, takes.course_id, takes.semester, takes.year, takes.grade, student.tot_cred from student inner join takes on student.ID = takes.ID) as temp inner join course on course.course_id = temp.course_id";

  //   if (req.method === "GET") {
  //     connection.query(studentsWithGradeSqlQuery, (err, results) => {
  //       res.writeHead(200, headers);
  //       res.end(JSON.stringify(results));
  //     });
  //   }
  // }

  if (req.url.startsWith("/studentsGrade/")) {
    const id = req.url.split("/").pop();

    const studentsGradeSqlQuery = `select * from (select student.ID, student.name, takes.course_id, takes.semester, takes.year, takes.grade, student.tot_cred from student inner join takes on student.ID = takes.ID) as temp inner join course on course.course_id = temp.course_id where ID = ${id}`;
    if (req.method === "GET") {
      connection.query(studentsGradeSqlQuery, (err, results) => {
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
