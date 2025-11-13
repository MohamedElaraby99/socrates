import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 character'],
        maxLength: [50, 'Name should be less than 50 character'],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phoneNumber: {
        type: String,
        required: function() {
            return this.role === 'USER';
        },
        unique: function() {
            return this.role === 'USER';
        },
        sparse: true,
        trim: true
    },
    fatherPhoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    governorate: {
        type: String,
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN', 'ASSISTANT', 'INSTRUCTOR'].includes(this.role);
        },
        trim: true
    },

    stage: {
        type: Schema.Types.ObjectId,
        ref: 'Stage',
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN', 'ASSISTANT', 'INSTRUCTOR'].includes(this.role);
        }
    },
    age: {
        type: Number,
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN', 'ASSISTANT', 'INSTRUCTOR'].includes(this.role);
        },
        min: [5, 'Age must be at least 5'],
        max: [100, 'Age cannot exceed 100']
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    idImages: {
        front: {
            public_id: { type: String },
            secure_url: { type: String }
        },
        back: {
            public_id: { type: String },
            secure_url: { type: String }
        }
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'ASSISTANT', 'INSTRUCTOR']
    },
    adminPermissions: {
        type: [String],
        default: [],
        enum: ['CREATE_ADMIN', 'DELETE_ADMIN', 'MANAGE_USERS', 'MANAGE_COURSES', 'MANAGE_PAYMENTS', 'VIEW_ANALYTICS']
    },
    // For INSTRUCTOR role - optional link to Instructor record (now optional)
    instructorProfile: {
        type: Schema.Types.ObjectId,
        ref: 'Instructor',
        required: false
    },
    // For INSTRUCTOR role - assigned courses
    assignedCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    code: {
        type: String,
        trim: true,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Featured field for instructors to show on home page
    featured: {
        type: Boolean,
        default: false
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    },
    // Track purchased courses and lessons
    hasPurchasedCourse: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    purchasedContentIds: [{
        type: Schema.Types.ObjectId,
        required: true
    }],
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        transactions: [{
            type: {
                type: String,
                enum: ['recharge', 'purchase', 'refund', 'access_code'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            code: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                default: 'completed'
            }
        }]
    }
},
    {
        timestamps: true
    });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    return next();
});

userSchema.methods = {
    generateJWTToken: function () {
        const payload = {
            id: this._id,
            role: this.role
        };

        // Include email for ADMIN/SUPER_ADMIN/ASSISTANT/INSTRUCTOR, phone number for USER
        if (this.role === 'USER') {
            payload.phoneNumber = this.phoneNumber;
            if (this.email) payload.email = this.email; // Include email if available
        } else {
            payload.email = this.email;
        }

        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '120d' } // Access token expires in 120 days
        )
    },

    generateRefreshToken: function () {
        const payload = {
            id: this._id,
            type: 'refresh'
        };

        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '120d' } // Refresh token expires in 120 days
        )
    },

    generateTokens: function () {
        return {
            accessToken: this.generateJWTToken(),
            refreshToken: this.generateRefreshToken()
        }
    },

    generatePasswordResetToken: async function () {
        const resetToken = await crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = await crypto
            .createHash('sha256')  
            .update(resetToken)
            .digest('hex');

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min from now

        return resetToken;
    }

}

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

export default model("User", userSchema);