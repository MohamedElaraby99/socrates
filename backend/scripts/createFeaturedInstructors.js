import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/user.model.js';
import instructorModel from '../models/instructor.model.js';

dotenv.config();

const createFeaturedInstructors = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name');
        console.log('Connected to database');

        // Find instructors who have detailed profiles
        const instructorsWithProfiles = await userModel.find({
            role: 'INSTRUCTOR',
            isActive: true,
            instructorProfile: { $exists: true, $ne: null }
        })
        .populate('instructorProfile')
        .limit(3);

        console.log(`Found ${instructorsWithProfiles.length} instructors with profiles`);

        // Mark the first 3 instructors as featured in their instructor profiles
        for (let i = 0; i < Math.min(3, instructorsWithProfiles.length); i++) {
            const user = instructorsWithProfiles[i];
            if (user.instructorProfile) {
                await instructorModel.findByIdAndUpdate(user.instructorProfile._id, {
                    featured: true,
                    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
                    totalStudents: Math.floor(Math.random() * 100) + 50 // Random students between 50-150
                });
                console.log(`Marked instructor ${user.fullName} as featured`);
            }
        }

        console.log('Featured instructors created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating featured instructors:', error);
        process.exit(1);
    }
};

createFeaturedInstructors();
