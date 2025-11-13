import mongoose from 'mongoose';
import User from './models/user.model.js';
import InstructorProfile from './models/instructor.model.js';

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/socrates';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkInstructors = async () => {
  try {
    console.log('🔍 Checking instructors in database...');

    // Find all instructors
    const instructors = await User.find({ role: 'INSTRUCTOR' })
      .populate('instructorProfile')
      .select('-password');

    console.log(`📊 Found ${instructors.length} instructors`);

    if (instructors.length === 0) {
      console.log('❌ No instructors found in database');
      return;
    }

    // Display instructor information
    instructors.forEach((instructor, index) => {
      console.log(`\n👨‍🏫 Instructor ${index + 1}:`);
      console.log(`   Name: ${instructor.fullName}`);
      console.log(`   Email: ${instructor.email}`);
      console.log(`   Featured: ${instructor.instructorProfile?.featured || false}`);
      console.log(`   Active: ${instructor.isActive}`);
    });

    // Count featured instructors
    const featuredCount = instructors.filter(inst => inst.instructorProfile?.featured).length;
    console.log(`\n⭐ Featured instructors: ${featuredCount}/${instructors.length}`);

    if (featuredCount === 0) {
      console.log('\n💡 No featured instructors found. Let me mark the first instructor as featured...');

      if (instructors.length > 0) {
        const firstInstructor = instructors[0];

        if (!firstInstructor.instructorProfile) {
          // Create instructor profile if it doesn't exist
          const profile = await InstructorProfile.create({
            name: firstInstructor.fullName,
            email: firstInstructor.email,
            bio: 'مدرس مميز في منصتنا التعليمية',
            specialization: 'متخصص في التعليم',
            experience: 5,
            education: 'بكالوريوس في التعليم',
            socialLinks: {},
            isActive: true,
            featured: true
          });

          firstInstructor.instructorProfile = profile._id;
          await firstInstructor.save();
          console.log(`✅ Created profile and marked instructor as featured: ${firstInstructor.fullName}`);
        } else {
          // Update existing profile
          firstInstructor.instructorProfile.featured = true;
          await firstInstructor.instructorProfile.save();
          console.log(`✅ Marked instructor as featured: ${firstInstructor.fullName}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking instructors:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting instructor check script...');
    await connectDB();
    await checkInstructors();
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
};

main();
