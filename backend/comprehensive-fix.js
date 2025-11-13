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

const comprehensiveFix = async () => {
  try {
    console.log('🔧 Running comprehensive featured instructors fix...');

    // Step 1: Find all featured instructor profiles
    console.log('\n1️⃣ Finding all featured instructor profiles...');
    const featuredProfiles = await InstructorProfile.find({
        featured: true,
        isActive: true
    });

    console.log(`Found ${featuredProfiles.length} featured profiles:`);
    featuredProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.name} (ID: ${profile._id})`);
    });

    // Step 2: Find all instructor users with profiles
    console.log('\n2️⃣ Finding all instructor users with profiles...');
    const usersWithProfiles = await User.find({
        role: 'INSTRUCTOR',
        isActive: true,
        instructorProfile: { $exists: true, $ne: null }
    }).populate('instructorProfile');

    console.log(`Found ${usersWithProfiles.length} users with instructor profiles:`);
    usersWithProfiles.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.fullName} (Profile ID: ${user.instructorProfile?._id})`);
    });

    // Step 3: Check for orphaned profiles and fix them
    console.log('\n3️⃣ Checking for orphaned profiles and fixing...');
    const profileIds = featuredProfiles.map(p => p._id.toString());
    const foundProfileIds = usersWithProfiles.map(u => u.instructorProfile?._id?.toString()).filter(Boolean);

    console.log(`Profile IDs from featured profiles: [${profileIds.join(', ')}]`);
    console.log(`Profile IDs from users: [${foundProfileIds.join(', ')}]`);

    const orphanedProfiles = featuredProfiles.filter(p => !foundProfileIds.includes(p._id.toString()));

    if (orphanedProfiles.length > 0) {
        console.log(`\nFound ${orphanedProfiles.length} orphaned profiles. Fixing...`);

        for (const orphanedProfile of orphanedProfiles) {
            console.log(`\n🔍 Processing orphaned profile: ${orphanedProfile.name}`);

            // Try to find user by email
            const matchingUser = await User.findOne({
                email: orphanedProfile.email,
                role: 'INSTRUCTOR'
            });

            if (matchingUser && !matchingUser.instructorProfile) {
                console.log(`  ✅ Found matching user without profile. Linking...`);
                matchingUser.instructorProfile = orphanedProfile._id;
                await matchingUser.save();
                console.log(`  ✅ Successfully linked profile to user: ${matchingUser.fullName}`);
            } else if (matchingUser && matchingUser.instructorProfile) {
                console.log(`  ⚠️ User already has a profile. Checking if it matches...`);
                if (matchingUser.instructorProfile.toString() === orphanedProfile._id.toString()) {
                    console.log(`  ✅ Profile already correctly linked`);
                } else {
                    console.log(`  ❌ User has different profile. Manual intervention needed.`);
                }
            } else {
                console.log(`  ❌ No matching user found. Creating new user...`);
                const newUser = await User.create({
                    fullName: orphanedProfile.name,
                    email: orphanedProfile.email,
                    password: 'tempPassword123!', // Should be changed by admin
                    role: 'INSTRUCTOR',
                    isActive: true,
                    instructorProfile: orphanedProfile._id
                });
                console.log(`  ✅ Created new user: ${newUser.fullName} (${newUser.email})`);
            }
        }
    } else {
        console.log('✅ No orphaned profiles found. All featured profiles are properly linked.');
    }

    // Step 4: Verify the fix by running the exact query from the controller
    console.log('\n4️⃣ Verifying fix by running controller query...');

    const limit = 6;
    const featuredProfilesQuery = await InstructorProfile.find({
        featured: true,
        isActive: true
    }).limit(parseInt(limit));

    console.log(`Query found ${featuredProfilesQuery.length} featured profiles`);

    if (featuredProfilesQuery.length > 0) {
        const profileIdsQuery = featuredProfilesQuery.map(profile => profile._id);

        const featuredInstructorsQuery = await User.find({
            role: 'INSTRUCTOR',
            isActive: true,
            instructorProfile: { $in: profileIdsQuery }
        })
        .populate({
            path: 'instructorProfile',
            select: 'name specialization bio experience education socialLinks profileImage rating totalStudents featured'
        })
        .populate({
            path: 'assignedCourses',
            select: 'title description image featured stage subject',
            options: { limit: 10 }
        })
        .select('fullName email instructorProfile assignedCourses isActive featured')
        .sort({ 'instructorProfile.rating': -1, 'instructorProfile.totalStudents': -1, createdAt: -1 });

        console.log(`Query found ${featuredInstructorsQuery.length} instructors with matching profiles:`);
        featuredInstructorsQuery.forEach((instructor, index) => {
            console.log(`  ${index + 1}. ${instructor.fullName} (Profile: ${instructor.instructorProfile?.name})`);
        });

        // Step 5: Transform the data as the controller does
        console.log('\n5️⃣ Transforming data as controller does...');
        const transformedInstructors = featuredInstructorsQuery.map(user => {
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
                profileUrl: `/instructors/${user._id}`
            };
        });

        console.log(`\n✅ Final result: ${transformedInstructors.length} instructors ready to be returned by API`);
        console.log('Instructors:');
        transformedInstructors.forEach((inst, index) => {
            console.log(`  ${index + 1}. ${inst.name} (${inst.specialization}) - Featured: ${inst.featured}`);
        });

        // Step 6: Show what the API response should look like
        console.log('\n6️⃣ Expected API response structure:');
        console.log(JSON.stringify({
            statusCode: 200,
            data: {
                instructors: transformedInstructors,
                total: transformedInstructors.length,
                limit: parseInt(limit),
                featured: transformedInstructors.filter(inst => inst.featured).length
            },
            message: "Featured instructors retrieved successfully",
            success: true
        }, null, 2));
    }

    console.log('\n🎉 Comprehensive fix completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Featured profiles found: ${featuredProfiles.length}`);
    console.log(`   - Users with profiles: ${usersWithProfiles.length}`);
    console.log(`   - Orphaned profiles fixed: ${orphanedProfiles.length}`);
    console.log(`   - Final instructors count: ${featuredProfilesQuery.length > 0 ? featuredInstructorsQuery.length : 0}`);

  } catch (error) {
    console.error('❌ Error in comprehensive fix:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting comprehensive featured instructors fix...');
    await connectDB();
    await comprehensiveFix();
    console.log('\n🎉 All fixes applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  }
};

main();
