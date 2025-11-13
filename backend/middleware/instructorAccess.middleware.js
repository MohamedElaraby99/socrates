import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Middleware to check if instructor can access a specific course
export const checkInstructorCourseAccess = asyncHandler(async (req, res, next) => {
    // Support both routes that use ":courseId" and those that use ":id"
    const courseId = req.params.courseId || req.params.id;

    // If request is unauthenticated, allow public access (e.g., viewing course details)
    if (!req.user) {
        return next();
    }

    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // Allow access for non-instructor roles (ADMIN, SUPER_ADMIN, STUDENT, etc.)
    if (userRole !== 'INSTRUCTOR') {
        return next();
    }

    // For instructors, check if they have access to this course
    const instructor = await userModel.findById(userId).populate('assignedCourses');

    if (!instructor) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // If no specific course is being requested, allow
    if (!courseId) {
        return next();
    }

    // Check if the course is in the instructor's assigned courses
    const assignedCourses = instructor.assignedCourses || [];
    const hasAccess = assignedCourses.some((course) => course?._id?.toString() === String(courseId));

    if (!hasAccess) {
        return next(new ApiError(403, "You don't have access to this course"));
    }

    next();
});

// Middleware to filter course lists for instructors
export const filterCoursesForInstructor = asyncHandler(async (req, res, next) => {
    // If unauthenticated, skip filtering
    if (!req.user) {
        return next();
    }

    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // For non-instructor roles, continue without filtering
    if (userRole !== 'INSTRUCTOR') {
        return next();
    }

    // For instructors, filter courses to only show assigned ones
    const instructor = await userModel.findById(userId).populate({
        path: 'assignedCourses',
        populate: [
            { path: 'stage', select: 'name' },
            { path: 'subject', select: 'name' },
            { path: 'instructor', select: 'name email' }
        ]
    });

    if (!instructor) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // Add filtered courses to request object
    req.filteredCourses = instructor.assignedCourses || [];

    next();
});
