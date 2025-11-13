import userModel from '../models/user.model.js';
import instructorModel from '../models/instructor.model.js';
import courseModel from '../models/course.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import fs from 'fs';
import path from 'path';

// Create instructor user account
export const createInstructor = asyncHandler(async (req, res, next) => {
    // Handle both JSON and FormData
    let requestData = req.body;

    // If FormData is sent, parse the socialLinks JSON string
    if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
        try {
            requestData.socialLinks = JSON.parse(req.body.socialLinks);
        } catch (error) {
            requestData.socialLinks = {};
        }
    }

    const { fullName, email, password, courseIds, specialization, bio, experience, education, socialLinks } = requestData;

    // Validate required fields
    if (!fullName || !email || !password) {
        return next(new ApiError(400, "Full name, email and password are required"));
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return next(new ApiError(400, "Email already exists"));
    }

    // Optionally validate courses
    let validCourseIds = [];
    if (Array.isArray(courseIds) && courseIds.length > 0) {
        const courses = await courseModel.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return next(new ApiError(400, "Some courses not found"));
        }
        validCourseIds = courseIds;
    }

    // Create instructor user
    const instructorUser = await userModel.create({
        fullName,
        email,
        password,
        role: 'INSTRUCTOR',
        assignedCourses: validCourseIds
    });

    if (!instructorUser) {
        return next(new ApiError(500, "Failed to create instructor user"));
    }

    // Handle profile image upload if provided
    let profileImageData = {};
    if (req.file) {
        profileImageData = {
            public_id: req.file.filename,
            secure_url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        };
    }

    // Create instructor profile
    try {
        const instructorProfile = await instructorModel.create({
            name: fullName,
            email: email,
            bio: bio || '',
            specialization: specialization || '',
            experience: experience || 0,
            education: education || '',
            socialLinks: socialLinks || {},
            profileImage: profileImageData,
            isActive: true
        });

        // Link the instructor profile to the user
        instructorUser.instructorProfile = instructorProfile._id;
        await instructorUser.save();

        console.log(`✅ Created instructor profile for ${fullName}`);

    } catch (profileError) {
        console.error('❌ Error creating instructor profile:', profileError);
        // Don't fail the entire creation if profile creation fails
        // The user account is already created successfully
    }

    // Remove password from response
    const userResponse = instructorUser.toObject();
    delete userResponse.password;

    res.status(201).json(
        new ApiResponse(201, userResponse, "Instructor user created successfully")
    );
});

// Assign courses to instructor
export const assignCoursesToInstructor = asyncHandler(async (req, res, next) => {
    const { instructorUserId, courseIds } = req.body;

    // Validate required fields
    if (!instructorUserId || !courseIds || !Array.isArray(courseIds)) {
        return next(new ApiError(400, "Instructor user ID and course IDs array are required"));
    }

    // Check if instructor user exists
    const instructorUser = await userModel.findById(instructorUserId);
    if (!instructorUser || instructorUser.role !== 'INSTRUCTOR') {
        return next(new ApiError(404, "Instructor user not found"));
    }

    // Validate course IDs exist
    const courses = await courseModel.find({ _id: { $in: courseIds } });
    if (courses.length !== courseIds.length) {
        return next(new ApiError(400, "Some courses not found"));
    }

    // Update instructor's assigned courses
    instructorUser.assignedCourses = courseIds;
    await instructorUser.save();

    // Populate the response
    const updatedInstructor = await userModel.findById(instructorUserId)
        .populate('instructorProfile')
        .populate('assignedCourses');

    res.status(200).json(
        new ApiResponse(200, updatedInstructor, "Courses assigned successfully")
    );
});

// Get instructor's assigned courses
export const getInstructorCourses = asyncHandler(async (req, res, next) => {
    const instructorId = req.user.id;

    // Get instructor user with populated courses
    const instructor = await userModel.findById(instructorId)
      .populate({
            path: 'assignedCourses',
            populate: [
                { path: 'stage', select: 'name' },
                { path: 'subject', select: 'name' },
                { path: 'instructor', select: 'name email' }
            ]
        })
        .populate('instructorProfile');

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
        return next(new ApiError(404, "Instructor not found"));
    }

    res.status(200).json(
        new ApiResponse(200, instructor.assignedCourses, "Instructor courses retrieved successfully")
    );
});

// Get instructor profile
export const getInstructorProfile = asyncHandler(async (req, res, next) => {
    const instructorId = req.user.id;

    const instructor = await userModel.findById(instructorId)
        .populate('instructorProfile')
        .select('-password');

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
        return next(new ApiError(404, "Instructor not found"));
    }

    res.status(200).json(
        new ApiResponse(200, instructor, "Instructor profile retrieved successfully")
    );
});

// Get all instructors (for admin)
export const getAllInstructors = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalInstructors = await userModel.countDocuments({ role: 'INSTRUCTOR' });

    const instructors = await userModel.find({ role: 'INSTRUCTOR' })
        .populate({
            path: 'instructorProfile',
            select: 'name specialization bio experience education socialLinks profileImage rating totalStudents featured'
        })
        .populate({
            path: 'assignedCourses',
            select: 'title description image featured stage subject'
        })
        .select('-password')
        .skip(skip)
        .limit(limit);

    // Transform the data to match frontend expectations
    const transformedInstructors = instructors.map(instructor => {
        const transformed = {
            _id: instructor._id,
            name: instructor.instructorProfile?.name || instructor.fullName,
            fullName: instructor.fullName,
            email: instructor.email,
            specialization: instructor.instructorProfile?.specialization || '',
            bio: instructor.instructorProfile?.bio || '',
            experience: instructor.instructorProfile?.experience || 0,
            education: instructor.instructorProfile?.education || '',
            socialLinks: instructor.instructorProfile?.socialLinks || {},
            profileImage: instructor.instructorProfile?.profileImage || instructor.avatar || {},
            rating: instructor.instructorProfile?.rating || 0,
            totalStudents: instructor.instructorProfile?.totalStudents || 0,
            featured: instructor.instructorProfile?.featured || false,
            assignedCourses: instructor.assignedCourses || [],
            role: instructor.role,
            isActive: instructor.isActive,
            createdAt: instructor.createdAt,
            updatedAt: instructor.updatedAt
        };
        return transformed;
    });

    const totalPages = Math.ceil(totalInstructors / limit);

    res.status(200).json(
        new ApiResponse(200, {
            instructors: transformedInstructors,
            pagination: {
                currentPage: page,
                totalPages,
                totalInstructors,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        }, "Instructors retrieved successfully")
    );
});

// Remove course assignment from instructor
export const removeCourseFromInstructor = asyncHandler(async (req, res, next) => {
    const { instructorUserId, courseId } = req.body;

    if (!instructorUserId || !courseId) {
        return next(new ApiError(400, "Instructor user ID and course ID are required"));
    }

    // Check if instructor user exists
    const instructorUser = await userModel.findById(instructorUserId);
    if (!instructorUser || instructorUser.role !== 'INSTRUCTOR') {
        return next(new ApiError(404, "Instructor user not found"));
    }

    // Remove course from assigned courses
    instructorUser.assignedCourses = instructorUser.assignedCourses.filter(
        course => course.toString() !== courseId
    );
    await instructorUser.save();

    res.status(200).json(
        new ApiResponse(200, instructorUser, "Course removed from instructor successfully")
    );
});

// Get all instructors for admin (includes all instructors, not just featured)
export const getAllInstructorsForAdmin = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalInstructors = await userModel.countDocuments({ role: 'INSTRUCTOR' });

    const instructors = await userModel.find({ role: 'INSTRUCTOR' })
        .populate({
            path: 'instructorProfile',
            select: 'name specialization bio experience education socialLinks profileImage rating totalStudents featured'
        })
        .populate({
            path: 'assignedCourses',
            select: 'title description image featured stage subject'
        })
        .select('-password')
        .skip(skip)
        .limit(limit);

    // Transform the data to match frontend expectations
    const transformedInstructors = instructors.map(instructor => {
        const transformed = {
            _id: instructor._id,
            name: instructor.instructorProfile?.name || instructor.fullName,
            fullName: instructor.fullName,
            email: instructor.email,
            specialization: instructor.instructorProfile?.specialization || '',
            bio: instructor.instructorProfile?.bio || '',
            experience: instructor.instructorProfile?.experience || 0,
            education: instructor.instructorProfile?.education || '',
            socialLinks: instructor.instructorProfile?.socialLinks || {},
            profileImage: instructor.instructorProfile?.profileImage || instructor.avatar || {},
            rating: instructor.instructorProfile?.rating || 0,
            totalStudents: instructor.instructorProfile?.totalStudents || 0,
            featured: instructor.instructorProfile?.featured || false,
            assignedCourses: instructor.assignedCourses || [],
            role: instructor.role,
            isActive: instructor.isActive,
            createdAt: instructor.createdAt,
            updatedAt: instructor.updatedAt
        };
        return transformed;
    });

    const totalPages = Math.ceil(totalInstructors / limit);

    res.status(200).json(
        new ApiResponse(200, {
            instructors: transformedInstructors,
            pagination: {
                currentPage: page,
                totalPages,
                totalInstructors,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        }, "Instructors retrieved successfully")
    );
});

// Get featured instructors (public endpoint)
export const getFeaturedInstructors = asyncHandler(async (req, res, next) => {
    // Remove limit to show ALL featured instructors
    const { limit, sortBy = 'created', sortOrder = '1' } = req.query; // Keep limit parameter for backward compatibility but don't use it

    console.log('=== GET FEATURED INSTRUCTORS ===');
    console.log('Requested limit:', limit);
    console.log('Sort by:', sortBy, 'Order:', sortOrder);
    console.log('Showing ALL featured instructors (no limit applied)');

    // First, find ALL featured instructor profiles - ensure we're getting the right data
    const featuredProfiles = await instructorModel.find({
        featured: true,
        isActive: true
    });

    console.log('Found featured profiles:', featuredProfiles.length);
    console.log('Featured profiles:', featuredProfiles.map(p => ({ id: p._id, name: p.name })));
    console.log('=== DEBUG: All featured profiles ===');
    featuredProfiles.forEach(p => console.log(`  Profile: ${p.name} (ID: ${p._id}, Featured: ${p.featured})`));

    if (featuredProfiles.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, {
                instructors: [],
                total: 0,
                limit: parseInt(limit),
                featured: 0
            }, "No featured instructors found")
        );
    }

    // Get the user IDs from the featured profiles - use _id correctly
    const profileIds = featuredProfiles.map(profile => profile._id);
    console.log('Profile IDs to search for:', profileIds);

    // Build dynamic sort object based on query parameters
    const buildSortObject = () => {
        const sortObj = {};
        const order = sortOrder === '1' ? 1 : -1;

        switch (sortBy) {
            case 'name':
                sortObj['instructorProfile.name'] = order;
                break;
            case 'rating':
                sortObj['instructorProfile.rating'] = order;
                break;
            case 'students':
                sortObj['instructorProfile.totalStudents'] = order;
                break;
            case 'experience':
                sortObj['instructorProfile.experience'] = order;
                break;
            case 'created':
                sortObj.createdAt = order;
                break;
            case 'featured':
                // Featured instructors first, then by display order, then by rating
                sortObj['instructorProfile.featured'] = -1;
                sortObj['instructorProfile.displayOrder'] = 1;
                sortObj['instructorProfile.rating'] = -1;
                sortObj['instructorProfile.totalStudents'] = -1;
                sortObj.createdAt = -1;
                break;
            default:
                // Default sort by creation date (oldest first)
                sortObj.createdAt = 1;
                break;
        }

        return sortObj;
    };

    const sortObject = buildSortObject();
    console.log('Applied sort object:', sortObject);

    // Find users with these instructor profiles - ensure we're using the correct field reference
    const featuredInstructors = await userModel.find({
        role: 'INSTRUCTOR',
        isActive: true,
        instructorProfile: { $in: profileIds }
    })
    .populate({
        path: 'instructorProfile',
        select: 'name specialization bio experience education socialLinks profileImage rating totalStudents featured'
    })
    .populate({
        path: 'assignedCourses',
        select: 'title description image featured stage subject',
        options: { limit: 10 } // Limit courses per instructor for performance
    })
    .select('fullName email instructorProfile assignedCourses isActive featured')
    .sort(sortObject);

    console.log('Found featured instructors after population:', featuredInstructors.length);
    console.log('=== DEBUG: Found instructors ===');
    featuredInstructors.forEach(inst => console.log(`  Instructor: ${inst.fullName} (Profile ID: ${inst.instructorProfile?._id})`));

    // Check for orphaned profiles (profiles without matching users)
    const foundProfileIds = featuredInstructors.map(inst => inst.instructorProfile?._id?.toString()).filter(Boolean);
    const orphanedProfiles = profileIds.filter(id => !foundProfileIds.includes(id.toString()));

    if (orphanedProfiles.length > 0) {
        console.log('Found orphaned profiles (profiles without matching users):', orphanedProfiles.length);
        console.log('Orphaned profile IDs:', orphanedProfiles);

        // Log details of orphaned profiles for debugging
        orphanedProfiles.forEach(id => {
            const profile = featuredProfiles.find(p => p._id.toString() === id.toString());
            if (profile) {
                console.log(`Orphaned profile: ${profile.name} (ID: ${id})`);
            }
        });

        // For now, we'll proceed with the instructors that have matching profiles
        console.log('Proceeding with instructors that have matching profiles');
    } else {
        console.log('✅ All featured profiles have matching users');
    }

    console.log('Found featured instructors:', featuredInstructors.length);
    console.log('Featured instructors details:', featuredInstructors.map(inst => ({
        id: inst._id,
        name: inst.fullName,
        profileId: inst.instructorProfile?._id,
        profileFeatured: inst.instructorProfile?.featured
    })));

    // Only return featured instructors - no fallback to non-featured instructors
    const instructorsToReturn = featuredInstructors;

    // Transform instructors to match expected format for frontend
    const transformedInstructors = instructorsToReturn.map(user => {
        const instructorProfile = user.instructorProfile;
        const assignedCourses = user.assignedCourses || [];

        return {
            _id: user._id,
            name: instructorProfile?.name || user.fullName,
            fullName: user.fullName,
            email: user.email,
            specialization: instructorProfile?.specialization || '',
            bio: instructorProfile?.bio || '',
            experience: instructorProfile?.experience || 0,
            education: instructorProfile?.education || '',
            socialLinks: instructorProfile?.socialLinks || {},
            profileImage: instructorProfile?.profileImage || user.avatar || {},
            rating: instructorProfile?.rating || 0,
            totalStudents: instructorProfile?.totalStudents || 0,
            featured: instructorProfile?.featured || user.featured || false,
            courses: assignedCourses.map(course => ({
                _id: course._id,
                title: course.title,
                description: course.description,
                image: course.image,
                featured: course.featured,
                stage: course.stage,
                subject: course.subject
            })),
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // Add a direct link to the instructor's profile page
            profileUrl: `/instructors/${user._id}`
        };
    });

    console.log('Transformed instructors:', transformedInstructors.length);
    console.log('Sample instructor data:', transformedInstructors[0] ? {
        id: transformedInstructors[0]._id,
        name: transformedInstructors[0].name,
        featured: transformedInstructors[0].featured,
        coursesCount: transformedInstructors[0].courses?.length || 0
    } : 'No instructors');

    return res.status(200).json(
        new ApiResponse(200, {
            instructors: transformedInstructors,
            total: transformedInstructors.length,
            featured: transformedInstructors.filter(inst => inst.featured).length,
            sortBy,
            sortOrder,
            message: limit ? `Showing all featured instructors (limit parameter ignored)` : `Showing all featured instructors`
        }, "Featured instructors retrieved successfully")
    );
});

// Toggle featured status for an instructor (admin only)
export const toggleInstructorFeatured = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;

    // Find the instructor user
    const instructor = await userModel.findOne({
        _id: instructorId,
        role: 'INSTRUCTOR'
    });

    if (!instructor) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // Find the instructor profile
    const instructorProfile = await instructorModel.findById(instructor.instructorProfile);

    if (!instructorProfile) {
        return next(new ApiError(404, "Instructor profile not found"));
    }

    // Toggle featured status in the instructor profile
    instructorProfile.featured = !instructorProfile.featured;
    await instructorProfile.save();

    console.log(`Instructor ${instructor.fullName} ${instructorProfile.featured ? 'featured' : 'unfeatured'}`);

    return res.status(200).json(
        new ApiResponse(200, {
            instructor: {
                _id: instructor._id,
                fullName: instructor.fullName,
                email: instructor.email,
                featured: instructorProfile.featured
            }
        }, `Instructor ${instructorProfile.featured ? 'featured' : 'unfeatured'} successfully`)
    );
});

// Update instructor profile (admin only)
export const updateInstructorProfile = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;

    // Handle both JSON and FormData
    let requestData = req.body;

    // If FormData is sent, parse the socialLinks JSON string
    if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
        try {
            requestData.socialLinks = JSON.parse(req.body.socialLinks);
        } catch (error) {
            requestData.socialLinks = {};
        }
    }

    const { fullName, email, specialization, bio, experience, education, socialLinks } = requestData;

    // Find the instructor user
    const instructorUser = await userModel.findOne({
        _id: instructorId,
        role: 'INSTRUCTOR'
    });

    if (!instructorUser) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // Update user basic info if provided
    if (fullName) instructorUser.fullName = fullName;
    if (email) instructorUser.email = email;

    // Update or create instructor profile
    let instructorProfile = await instructorModel.findById(instructorUser.instructorProfile);

    if (!instructorProfile) {
        // Create instructor profile if it doesn't exist
        instructorProfile = await instructorModel.create({
            name: fullName || instructorUser.fullName,
            email: email || instructorUser.email,
            bio: bio || '',
            specialization: specialization || '',
            experience: experience || 0,
            education: education || '',
            socialLinks: socialLinks || {},
            isActive: true
        });

        instructorUser.instructorProfile = instructorProfile._id;
    } else {
        // Update existing profile
        if (fullName) instructorProfile.name = fullName;
        if (email) instructorProfile.email = email;
        if (specialization !== undefined) instructorProfile.specialization = specialization;
        if (bio !== undefined) instructorProfile.bio = bio;
        if (experience !== undefined) instructorProfile.experience = experience;
        if (education !== undefined) instructorProfile.education = education;
        if (socialLinks) instructorProfile.socialLinks = socialLinks;
    }

    // Save both documents
    await instructorUser.save();
    await instructorProfile.save();

    // Return updated instructor data
    const updatedInstructor = await userModel.findById(instructorId)
        .populate('instructorProfile')
        .select('-password');

    res.status(200).json(
        new ApiResponse(200, updatedInstructor, "Instructor profile updated successfully")
    );
});

// Upload instructor profile image (admin only)
export const uploadInstructorProfileImage = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;

    if (!req.file) {
        return next(new ApiError(400, "No image file provided"));
    }

    // Find the instructor user
    const instructorUser = await userModel.findOne({
        _id: instructorId,
        role: 'INSTRUCTOR'
    });

    if (!instructorUser) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // Get or create instructor profile
    let instructorProfile = await instructorModel.findById(instructorUser.instructorProfile);

    if (!instructorProfile) {
        instructorProfile = await instructorModel.create({
            name: instructorUser.fullName,
            email: instructorUser.email,
            bio: '',
            specialization: '',
            experience: 0,
            education: '',
            socialLinks: {},
            isActive: true
        });

        instructorUser.instructorProfile = instructorProfile._id;
        await instructorUser.save();
    }

    // Delete old image if exists
    if (instructorProfile.profileImage?.public_id) {
        try {
            const oldImagePath = path.join('uploads', instructorProfile.profileImage.public_id);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        } catch (error) {
            console.error('Error deleting old image:', error);
        }
    }

    // Update with new image
    instructorProfile.profileImage = {
        public_id: req.file.filename,
        secure_url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    };

    await instructorProfile.save();

    // Return updated instructor data
    const updatedInstructor = await userModel.findById(instructorId)
        .populate('instructorProfile')
        .select('-password');

    res.status(200).json(
        new ApiResponse(200, updatedInstructor, "Profile image uploaded successfully")
    );
});

// Update instructor display order (admin only)
export const updateInstructorDisplayOrder = asyncHandler(async (req, res, next) => {
    const { instructorOrders } = req.body;

    if (!Array.isArray(instructorOrders)) {
        return next(new ApiError(400, "instructorOrders must be an array"));
    }

    // Validate instructorOrders format
    for (const item of instructorOrders) {
        if (!item.instructorId || typeof item.displayOrder !== 'number') {
            return next(new ApiError(400, "Each item must have instructorId and displayOrder"));
        }
    }

    // Update display order for each instructor
    const updatePromises = instructorOrders.map(async (item) => {
        const { instructorId, displayOrder } = item;

        // Find the instructor profile
        const instructorProfile = await instructorModel.findById(instructorId);
        if (!instructorProfile) {
            throw new Error(`Instructor profile not found: ${instructorId}`);
        }

        instructorProfile.displayOrder = displayOrder;
        return instructorProfile.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json(
        new ApiResponse(200, { updatedCount: instructorOrders.length }, "Display order updated successfully")
    );
});

// Delete instructor (admin only)
export const deleteInstructor = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;

    // Find the instructor user
    const instructorUser = await userModel.findOne({
        _id: instructorId,
        role: 'INSTRUCTOR'
    });

    if (!instructorUser) {
        return next(new ApiError(404, "Instructor not found"));
    }

    // Delete instructor profile if exists
    if (instructorUser.instructorProfile) {
        const instructorProfile = await instructorModel.findById(instructorUser.instructorProfile);
        if (instructorProfile) {
            // Delete profile image if exists
            if (instructorProfile.profileImage?.public_id) {
                try {
                    const imagePath = path.join('uploads', instructorProfile.profileImage.public_id);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                } catch (error) {
                    console.error('Error deleting profile image:', error);
                }
            }
            await instructorProfile.deleteOne();
        }
    }

    // Delete the user account
    await instructorUser.deleteOne();

    res.status(200).json(
        new ApiResponse(200, null, "Instructor deleted successfully")
    );
});