const admin = require('firebase-admin');
const { verifyToken: verifyJWTToken } = require('../utils/jwt');

let isFirebaseAdminInitialized = false;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      // Trim whitespace and check if it's a valid non-empty string
      const trimmedServiceAccount = serviceAccount.trim();
      
      if (trimmedServiceAccount && trimmedServiceAccount.length > 0) {
        try {
          // Validate JSON format before parsing
          let serviceAccountJson;
          try {
            serviceAccountJson = JSON.parse(trimmedServiceAccount);
          } catch (jsonError) {
            console.error('❌ Invalid JSON in FIREBASE_SERVICE_ACCOUNT environment variable');
            console.error('   Please ensure FIREBASE_SERVICE_ACCOUNT contains valid JSON');
            console.error('   Error details:', jsonError.message);
            throw jsonError;
          }
          
          // Validate that it's an object with required fields
          if (typeof serviceAccountJson !== 'object' || serviceAccountJson === null) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT must be a JSON object');
          }
          
          // Initialize Firebase Admin
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson)
          });
          isFirebaseAdminInitialized = true;
          console.log('✅ Firebase Admin initialized successfully');
        } catch (parseError) {
          console.warn('⚠️  Failed to initialize Firebase Admin with FIREBASE_SERVICE_ACCOUNT');
          console.warn('   Continuing in development mode without Firebase Admin authentication');
        }
      } else {
        console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT is empty. Running in development mode.');
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        // Fallback: Initialize with default credentials
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
        isFirebaseAdminInitialized = true;
        console.log('✅ Firebase Admin initialized with application default credentials');
      } catch (defaultError) {
        console.warn('⚠️  Error initializing with default credentials:', defaultError.message);
        console.warn('   Continuing in development mode without Firebase Admin authentication');
      }
    } else {
      console.warn('⚠️  Firebase Admin not configured. Running in development mode without authentication.');
      console.warn('   To enable authentication, set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS');
    }
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization error:', error.message);
    console.warn('   Running in development mode without Firebase Admin authentication');
  }
} else {
  isFirebaseAdminInitialized = true;
}

// Verify token (supports both JWT and Firebase tokens)
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Try JWT first (shorter tokens, typically < 500 chars)
    if (token.length < 500) {
      try {
        const decoded = verifyJWTToken(token);
        req.user = {
          uid: decoded.userId,
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          admin: decoded.isAdmin || false
        };
        return next();
      } catch (jwtError) {
        // Not a JWT token, try Firebase
      }
    }

    // Try Firebase token verification
    if (isFirebaseAdminInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        return next();
      } catch (firebaseError) {
        // If Firebase Admin is not properly initialized, fall back
        if (firebaseError.message?.includes('Project Id') || firebaseError.message?.includes('Unable to detect')) {
          console.warn('⚠️  Firebase Admin not properly configured. Trying JWT...');
          // Will fall through to dev mode below
        } else {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
      }
    }

    // Development mode fallback
    console.warn('⚠️  Running in development mode - authentication bypassed');
    req.user = {
      uid: token.length > 28 ? token.substring(0, 28) : token,
      email: process.env.DEV_USER_EMAIL || 'dev@example.com',
      name: 'Development User'
    };
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user is admin
// Note: You'll need to set custom claims in Firebase for admin users
// Or maintain an admin list in your database
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In development mode without Firebase Admin, allow all authenticated users
    if (!isFirebaseAdminInitialized) {
      console.warn('⚠️  Admin check bypassed in development mode');
      return next();
    }

    // Check if user has admin custom claim
    if (req.user.admin === true) {
      return next();
    }

    // Alternative: Check against admin email list
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
    if (adminEmails.length > 0 && adminEmails.includes(req.user.email)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};

