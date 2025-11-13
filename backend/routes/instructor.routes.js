import express from 'express';
import {
    createInstructor,
    assignCoursesToInstructor,
    getInstructorCourses,
    getInstructorProfile,
    getAllInstructors,
    getAllInstructorsForAdmin,
    removeCourseFromInstructor,
    getFeaturedInstructors,
    toggleInstructorFeatured,
    updateInstructorProfile,
    uploadInstructorProfileImage,
    updateInstructorDisplayOrder,
    deleteInstructor
} from '../controllers/instructor.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { authorisedRoles } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllInstructors);
router.get('/featured', getFeaturedInstructors);

// Admin routes for managing featured status
router.patch('/:instructorId/toggle-featured', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), toggleInstructorFeatured);

// Routes for admin/super admin to manage instructors
router.post('/create', isLoggedIn, authorisedRoles('SUPER_ADMIN'), upload.single('profileImage'), createInstructor);
router.post('/assign-courses', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), assignCoursesToInstructor);
router.post('/remove-course', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), removeCourseFromInstructor);
router.get('/all', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN', 'ASSISTANT'), getAllInstructorsForAdmin);

// Special routes (must come before dynamic :instructorId routes)
router.put('/display-order', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), updateInstructorDisplayOrder);

// Routes for updating instructor profiles and images
router.put('/:instructorId', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), updateInstructorProfile);
router.post('/:instructorId/upload-image', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), upload.single('profileImage'), uploadInstructorProfileImage);
router.delete('/:instructorId', isLoggedIn, authorisedRoles('SUPER_ADMIN', 'ADMIN'), deleteInstructor);

// Routes for instructors to access their data
router.get('/my-courses', isLoggedIn, authorisedRoles('INSTRUCTOR'), getInstructorCourses);
router.get('/profile', isLoggedIn, authorisedRoles('INSTRUCTOR'), getInstructorProfile);

export default router;