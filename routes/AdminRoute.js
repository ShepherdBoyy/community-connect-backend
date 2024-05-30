import express from "express"
import con from "../utils/db.js"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"

const router = express.Router()

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admin WHERE email = ? and password = ?"
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query Error" })
    if (result.length > 0) {
      const email = result[0].email
      const token = jwt.sign(
        { role: "admin", email: email },
        "jwt_secret_key",
        {
          expiresIn: "1d",
        }
      )
      res.cookie("token", token)
      return res.json({ loginStatus: true })
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" })
    }
  })
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images")
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    )
  },
})

const upload = multer({
  storage: storage,
})

router.post("/add_official", upload.single("image"), (req, res) => {
  const sql =
    "INSERT INTO barangay_officials (`name`, `age`, `position`, `image`) VALUES (?)"
  const values = [
    req.body.name,
    req.body.age,
    req.body.position,
    req.file.filename,
  ]
  con.query(sql, [values], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true })
  })
})

router.get("/official", (req, res) => {
  const sql = "SELECT * FROM barangay_officials"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/official/:id", (req, res) => {
  const id = req.params.id
  const sql = "SELECT * FROM barangay_officials WHERE id = ?"
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.put("/edit_official/:id", (req, res) => {
  const id = req.params.id
  const sql =
    "UPDATE barangay_officials SET name = ?, age = ?, position = ? WHERE id = ?"
  const values = [req.body.name, req.body.age, req.body.position]

  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err })
    return res.json({ Status: true, Result: result })
  })
})

router.delete("/delete_official/:id", (req, res) => {
  const id = req.params.id
  const sql = "DELETE FROM barangay_officials WHERE id = ?"
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err })
    return res.json({ Status: true, Result: result })
  })
})

router.post("/add_resident", (req, res) => {
  const sql =
    "INSERT INTO residents (`name`, `age`, `sex`, `birthdate`, `purok`, `house_number`, `kinship`, `address`, `education`, `occupation`) VALUES (?)"
  const values = [
    req.body.name,
    req.body.age,
    req.body.sex,
    req.body.birthdate,
    req.body.purok,
    req.body.houseNumber,
    req.body.kinship,
    req.body.address,
    req.body.educationalAttainment,
    req.body.occupation,
  ]
  con.query(sql, [values], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err })
    return res.json({ Status: true })
  })
})

router.get("/residents", (req, res) => {
  const sql = "SELECT * FROM residents"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/residents/:id", (req, res) => {
  const id = req.params.id
  const sql = "SELECT * FROM residents WHERE id = ?"
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.put("/edit_residents/:id", (req, res) => {
  const id = req.params.id
  const sql =
    "UPDATE residents SET name = ?, age = ?, sex = ?, birthdate = ?, purok = ?, house_number = ?, kinship = ?, address = ?, education = ?, occupation = ? WHERE id = ?"
  const values = [
    req.body.name,
    req.body.age,
    req.body.sex,
    req.body.birthdate,
    req.body.purok,
    req.body.houseNumber,
    req.body.kinship,
    req.body.address,
    req.body.educationalAttainment,
    req.body.occupation,
  ]

  const birthdate = new Date(req.body.birthdate)
  const formattedBirthdate = birthdate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")

  // Update the birthdate value in the array
  values[3] = formattedBirthdate

  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err })
    return res.json({ Status: true, Result: result })
  })
})

router.delete("/delete_resident/:id", (req, res) => {
  const id = req.params.id
  const sql = "DELETE FROM residents WHERE id = ?"
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/household_record", (req, res) => {
  const sql =
    "SELECT house_number, COUNT(*) AS household_members_count FROM residents GROUP BY house_number"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/household_members/:house_number", (req, res) => {
  const house_number = req.params.house_number
  const sql = "SELECT * FROM residents WHERE house_number = ?"
  con.query(sql, [house_number], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/residents_count", (req, res) => {
  const sql = "SELECT COUNT(id) AS residents FROM residents"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/male_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total_male FROM residents WHERE sex = 'male'"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/female_count", (req, res) => {
  const sql =
    "SELECT COUNT(*) AS total_female FROM residents WHERE sex = 'female'"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/household_count", (req, res) => {
  const sql =
    "SELECT COUNT(DISTINCT house_number) AS total_households FROM residents"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.get("/logout", (req, res) => {
  res.clearCookie("token")
  return res.json({ Status: true })
})

router.get("/password", (req, res) => {
  const sql = "SELECT password FROM admin"
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

router.put("/change_password", (req, res) => {
  const sql = "UPDATE admin SET password = ?, email = ? WHERE id = 1"

  con.query(sql, [req.body.newPassword, req.body.newEmail], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" })
    return res.json({ Status: true, Result: result })
  })
})

export { router as adminRouter }
