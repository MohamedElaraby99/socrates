import mongoose from 'mongoose';
import User from './models/user.model.js';
import InstructorProfile from './models/instructor.model.js';

// Connect to MongoDB - Use production URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the4g';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugFeaturedInstructors = async () => {
  try {
    console.log('🔍 Debugging featured instructors query...');

    // Check all instructors and their profiles first
    console.log('\n1. Checking all instructors and their profile status:');
    const allInstructors = await User.find({ role: 'INSTRUCTOR' }).populate('instructorProfile');

    allInstructors.forEach((instructor, index) => {
        console.log(`\nInstructor ${index + 1}: ${instructor.fullName}`);
        console.log(`  - ID: ${instructor._id}`);
        console.log(`  - Profile exists: ${!!instructor.instructorProfile}`);
        console.log(`  - Profile ID: ${instructor.instructorProfile?._id || 'N/A'}`);
        console.log(`  - Profile featured: ${instructor.instructorProfile?.featured || false}`);
        console.log(`  - User featured: ${instructor.featured || false}`);
    });

    // Test the exact query used in the controller
    console.log('\n2. Testing featured instructor profiles query (controller logic):');
    const featuredProfiles = await InstructorProfile.find({
        featured: true,
        isActive: true
    });

    console.log(`Found ${featuredProfiles.length} featured profiles:`);
    featuredProfiles.forEach((profile, index) => {
        console.log(`  Profile ${index + 1}: ${profile.name} (ID: ${profile._id})`);
    });

    if (featuredProfiles.length > 0) {
        const profileIds = featuredProfiles.map(profile => profile._id);
        console.log('\nProfile IDs to search for:', profileIds);

        console.log('\n3. Testing users with these instructor profile IDs:');
        const usersWithProfiles = await User.find({
            role: 'INSTRUCTOR',
            isActive: true,
            instructorProfile: { $in: profileIds }
        }).populate('instructorProfile');

        console.log(`Found ${usersWithProfiles.length} users with matching profiles:`);
        usersWithProfiles.forEach((user, index) => {
            console.log(`  User ${index + 1}: ${user.fullName} (Profile ID: ${user.instructorProfile?._id})`);
        });

        // Check if there are any profile IDs that don't match user instructorProfile fields
        console.log('\n4. Checking for mismatched IDs:');
        const foundProfileIds = usersWithProfiles.map(user => user.instructorProfile?._id?.toString()).filter(Boolean);
        const missingProfiles = profileIds.filter(id => !foundProfileIds.includes(id.toString()));

        if (missingProfiles.length > 0) {
            console.log(`Found ${missingProfiles.length} profiles that don't match any user:`);
            missingProfiles.forEach(id => {
                const profile = featuredProfiles.find(p => p._id.toString() === id.toString());
                console.log(`  - Profile: ${profile?.name} (ID: ${id})`);
            });
        } else {
            console.log('All profile IDs match user instructorProfile fields');
        }
    }

    // Test alternative query approaches
    console.log('\n5. Testing alternative query approaches:');

    console.log('Direct profile featured query:');
    const directQuery = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        'instructorProfile.featured': true
    }).populate('instructorProfile');
    console.log(`Found ${directQuery.length} instructors`);

    console.log('User featured field query:');
    const featuredFieldQuery = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        featured: true
    });
    console.log(`Found ${featuredFieldQuery.length} instructors`);

    console.log('OR query:');
    const orQuery = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        $or: [
            { 'instructorProfile.featured': true },
            { featured: true }
        ]
    }).populate('instructorProfile');
    console.log(`Found ${orQuery.length} instructors`);

  } catch (error) {
    console.error('❌ Error debugging:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting debug script...');
    await connectDB();
    await debugFeaturedInstructors();
    console.log('🎉 Debug script completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
};

main();
