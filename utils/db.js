import mysql from "mysql"

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "barangay_database",
})

con.connect(function (err) {
  if (err) {
    console.log("Connection Error")
  } else {
    console.log("Successfully Connected")
  }
})

export default con
