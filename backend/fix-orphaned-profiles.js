import mongoose from 'mongoose';
import User from './models/user.model.js';
import InstructorProfile from './models/instructor.model.js';

// Connect to MongoDB - Use production URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socrates';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixOrphanedProfiles = async () => {
  try {
    console.log('🔧 Fixing orphaned instructor profiles...');

    // Find all featured instructor profiles
    const featuredProfiles = await InstructorProfile.find({
        featured: true,
        isActive: true
    });

    console.log(`Found ${featuredProfiles.length} featured profiles`);

    // Find users with instructor profiles
    const usersWithProfiles = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        instructorProfile: { $exists: true, $ne: null }
    }).populate('instructorProfile');

    console.log(`Found ${usersWithProfiles.length} users with instructor profiles`);

    // Find orphaned profiles
    const profileIds = featuredProfiles.map(p => p._id.toString());
    const foundProfileIds = usersWithProfiles.map(u => u.instructorProfile?._id?.toString()).filter(Boolean);
    const orphanedProfiles = featuredProfiles.filter(p => !foundProfileIds.includes(p._id.toString()));

    console.log(`\nFound ${orphanedProfiles.length} orphaned profiles:`);
    orphanedProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name} (ID: ${profile._id}) - Email: ${profile.email}`);
    });

    if (orphanedProfiles.length > 0) {
        console.log('\n🔍 Checking if these profiles should be linked to existing users...');

        for (const orphanedProfile of orphanedProfiles) {
            // Try to find a user with matching email
            const matchingUser = await User.findOne({
                email: orphanedProfile.email,
                role: 'INSTRUCTOR'
            });

            if (matchingUser) {
                console.log(`\n✅ Found matching user for profile "${orphanedProfile.name}":`);
                console.log(`   User: ${matchingUser.fullName} (${matchingUser.email})`);
                console.log(`   User ID: ${matchingUser._id}`);
                console.log(`   Current instructorProfile: ${matchingUser.instructorProfile}`);

                if (!matchingUser.instructorProfile) {
                    console.log(`   -> Linking profile to user...`);
                    matchingUser.instructorProfile = orphanedProfile._id;
                    await matchingUser.save();
                    console.log(`   ✅ Successfully linked profile to user!`);
                } else {
                    console.log(`   -> User already has an instructorProfile, checking if it matches...`);
                    if (matchingUser.instructorProfile.toString() === orphanedProfile._id.toString()) {
                        console.log(`   ✅ Profile already correctly linked!`);
                    } else {
                        console.log(`   ⚠️  User has different profile (${matchingUser.instructorProfile}), manual intervention needed`);
                    }
                }
            } else {
                console.log(`\n❌ No matching user found for profile "${orphanedProfile.name}" (${orphanedProfile.email})`);

                // Option 1: Create a new user for this profile
                console.log(`   -> Creating new user for this profile...`);
                const newUser = await User.create({
                    fullName: orphanedProfile.name,
                    email: orphanedProfile.email,
                    password: 'tempPassword123!', // Should be changed by admin
                    role: 'INSTRUCTOR',
                    isActive: true,
                    instructorProfile: orphanedProfile._id
                });
                console.log(`   ✅ Created new user: ${newUser.fullName} (${newUser.email})`);

                // Option 2: Delete the orphaned profile (uncomment if preferred)
                // console.log(`   -> Deleting orphaned profile...`);
                // await InstructorProfile.findByIdAndDelete(orphanedProfile._id);
                // console.log(`   ✅ Deleted orphaned profile`);
            }
        }
    }

    // Final check
    console.log('\n🔍 Running final verification...');
    const finalCheck = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        'instructorProfile.featured': true
    }).populate('instructorProfile');

    console.log(`✅ Final count of featured instructors with proper linking: ${finalCheck.length}`);

  } catch (error) {
    console.error('❌ Error fixing orphaned profiles:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting orphaned profiles fix script...');
    await connectDB();
    await fixOrphanedProfiles();
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
};

main();
