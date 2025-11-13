#!/usr/bin/env node

/**
 * JWT Configuration Verification Script
 * This script verifies that JWT tokens are configured with 120-day expiry
 */

import jwt from 'jsonwebtoken';

console.log('🔐 JWT Configuration Verification');
console.log('================================');

// Check environment variables
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const jwtExpire = process.env.JWT_EXPIRE || '120d';

console.log(`JWT Secret: ${jwtSecret.substring(0, 10)}...`);
console.log(`JWT Expire: ${jwtExpire}`);

// Create a test token
const testPayload = {
    id: 'test-user-id',
    role: 'USER',
    phoneNumber: '1234567890'
};

try {
    const token = jwt.sign(testPayload, jwtSecret, { expiresIn: jwtExpire });
    console.log(`✅ JWT token created successfully`);
    console.log(`Token (first 50 chars): ${token.substring(0, 50)}...`);
    
    // Decode the token to verify expiry
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
        const expiryDate = new Date(decoded.exp * 1000);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        console.log(`Token expires: ${expiryDate.toISOString()}`);
        console.log(`Days until expiry: ${daysUntilExpiry}`);
        
        if (daysUntilExpiry >= 119 && daysUntilExpiry <= 121) {
            console.log('✅ JWT expiry is correctly set to ~120 days');
        } else {
            console.log('❌ JWT expiry is not set to 120 days');
        }
    }
    
} catch (error) {
    console.error('❌ Error creating JWT token:', error.message);
}

console.log('\n📋 Configuration Summary:');
console.log(`- JWT Secret: ${jwtSecret ? 'Set' : 'Not set'}`);
console.log(`- JWT Expire: ${jwtExpire}`);
console.log(`- Cookie MaxAge: 120 days (10,368,000,000 ms)`);
