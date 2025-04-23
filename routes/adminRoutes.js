const express = require("express");

const protect = require("../middlewares/protect");
const { getAllUsers,getAllAdmins,addAdmin, deleteUser ,deleteAdmin, getAllReports } = require("../controllers/adminControllers");

const router = express.Router();

router.get("/getAllUsers", protect, getAllUsers);
router.get("/getAllAdmins", protect, getAllAdmins);
router.post("/addAdmin", protect, addAdmin);
router.delete("/deleteUser/:userId", protect, deleteUser);
router.delete("/deleteAdmin/:adminId", protect, deleteAdmin);
router.get("/getAllReports", protect, getAllReports);

module.exports = router;
