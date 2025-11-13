import express from "express";
import {
  scanQRAttendance,
  takeAttendanceByPhone,
  getUserAttendance,
  getUserAttendanceStats,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceDashboard,
  getGroupAttendance,
  analyzePhotoAttendance
} from "../controllers/attendance.controller.js";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// @route   POST /api/v1/attendance/scan-qr
// @desc    Scan QR code and record attendance
// @access  Instructor/Admin/Assistant
router.post("/scan-qr", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), scanQRAttendance);
// Capture image and analyze to extract attendance info
router.post("/analyze-photo", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), analyzePhotoAttendance);

// @route   POST /api/v1/attendance/take-by-phone
// @desc    Take attendance by phone number and user ID
// @access  Instructor/Admin/Assistant
router.post("/take-by-phone", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), takeAttendanceByPhone);

// @route   GET /api/v1/attendance/user/:userId
// @desc    Get attendance records for a user
// @access  User (own records) / Admin/Instructor
router.get("/user/:userId", isLoggedIn, getUserAttendance);

// @route   GET /api/v1/attendance/user/:userId/stats
// @desc    Get attendance statistics for a user
// @access  User (own stats) / Admin/Instructor
router.get("/user/:userId/stats", isLoggedIn, getUserAttendanceStats);

// @route   GET /api/v1/attendance/group/:groupId
// @desc    Get attendance records for a group
// @access  Admin/Instructor/Assistant
router.get("/group/:groupId", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), getGroupAttendance);

// @route   GET /api/v1/attendance
// @desc    Get all attendance records
// @access  Admin/Instructor/Assistant
router.get("/", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), getAllAttendance);

// @route   GET /api/v1/attendance/dashboard
// @desc    Get attendance dashboard overview
// @access  Admin/Instructor/Assistant
router.get("/dashboard", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), getAttendanceDashboard);

// @route   PUT /api/v1/attendance/:id
// @desc    Update attendance record
// @access  Admin/Instructor/Assistant
router.put("/:id", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), updateAttendance);

// @route   DELETE /api/v1/attendance/:id
// @desc    Delete attendance record
// @access  Admin/Instructor/Assistant
router.delete("/:id", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), deleteAttendance);

export default router;
