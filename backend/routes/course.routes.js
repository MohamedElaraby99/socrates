import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import upload from '../middleware/multer.middleware.js';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import { checkInstructorCourseAccess, filterCoursesForInstructor } from '../middleware/instructorAccess.middleware.js';
import {
  getAllCourses,
  getAdminCourses,
  getCourseById,
  getLessonById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getFeaturedCourses,
  toggleFeatured,
  addUnitToCourse,
  addLessonToUnit,
  addDirectLessonToCourse,
  updateLesson,
  deleteLesson,
  reorderLessons,
  deleteUnit,
  updateUnit,
  updateLessonContent,
  submitTrainingAttempt,
  getCoursesByInstructor,
  incrementVideoViews
} from '../controllers/course.controller.js';

const router = express.Router();

// Public routes (with optional authentication for filtering)
router.get('/', async (req, res, next) => {
  // Try to authenticate if token exists, but don't fail if not authenticated
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      // Try to verify the token and set user info
      const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch full user data including stage
      const user = await User.findById(userDetails.id).populate('stage');
      if (user) {
        req.user = {
          ...userDetails,
          stage: user.stage?._id,
          stageName: user.stage?.name
        };
        console.log('Optional auth success - User stage:', req.user.stage);
      }
    } catch (error) {
      console.log('Optional auth failed, continuing without user context:', error.message);
      // Continue without authentication - req.user will be undefined
    }
  }
  
  getAllCourses(req, res, next);
});
router.get('/featured', getFeaturedCourses);
router.get('/instructor/:instructorId', getCoursesByInstructor);
router.patch('/:id/toggle-featured', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), toggleFeatured);

// Admin routes
router.get('/admin/all', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), getAdminCourses);
router.get('/stats', getCourseStats);
// IMPORTANT: Keep /:id route at the end to avoid intercepting other specific routes
router.get('/:id', checkInstructorCourseAccess, getCourseById);

// Get optimized lesson data
router.get('/:courseId/lessons/:lessonId', isLoggedIn, checkInstructorCourseAccess, getLessonById);

// Protected routes
router.post('/', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), createCourse);
router.put('/:id', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, updateCourse);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, deleteCourse);

// Course structure management - Unit operations
router.post('/:courseId/units', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, addUnitToCourse);
router.put('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, updateUnit);
router.delete('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, deleteUnit);

// Course structure management - Lesson operations
router.post('/:courseId/units/:unitId/lessons', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), 
  checkInstructorCourseAccess,
  addLessonToUnit
);

router.post('/:courseId/direct-lessons', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), 
  checkInstructorCourseAccess,
  addDirectLessonToCourse
);

router.put('/:courseId/lessons/:lessonId', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), 
  checkInstructorCourseAccess,
  updateLesson
);

router.put('/:courseId/lessons/:lessonId/content', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, updateLessonContent);

router.delete('/:courseId/lessons/:lessonId', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, deleteLesson);
router.put('/:courseId/reorder-lessons', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'), checkInstructorCourseAccess, reorderLessons);

// Training attempt submission
router.post('/:courseId/lessons/:lessonId/trainings/:trainingIndex/submit', isLoggedIn, submitTrainingAttempt);

// Increment video views (public endpoint - anyone can view videos)
router.post('/:courseId/lessons/:lessonId/videos/:videoIndex/views', incrementVideoViews);

export default router;
