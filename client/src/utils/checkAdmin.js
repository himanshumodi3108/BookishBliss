import { getAuth } from 'firebase/auth';

/**
 * Check if the current user is an admin
 * @param {Object} user - The user object from AuthContext or login result
 * @returns {Promise<boolean>} - True if user is admin, false otherwise
 */
export const checkAdminStatus = async (user) => {
  if (!user) {
    console.log('checkAdminStatus: No user provided');
    return false;
  }

  try {
    // Get user email
    const userEmail = user.email || user.user?.email;
    console.log('checkAdminStatus: Checking user email:', userEmail);
    console.log('checkAdminStatus: User object:', user);
    
    // Check admin email list from environment (works for both JWT and Firebase)
    const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS;
    const adminEmails = adminEmailsEnv ? adminEmailsEnv.split(',').map(e => e.trim()).filter(e => e) : [];
    console.log('checkAdminStatus: Admin emails from env:', adminEmails);
    
    // Only check email if admin emails are configured
    if (adminEmails.length > 0 && userEmail) {
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      const isAdminEmail = adminEmails.some(email => email.toLowerCase().trim() === normalizedUserEmail);
      console.log('checkAdminStatus: Is admin email?', isAdminEmail);
      if (isAdminEmail) {
        return true;
      }
    }

    // For JWT users, check if isAdmin flag exists in user object (must be explicitly true)
    console.log('checkAdminStatus: user.isAdmin =', user.isAdmin);
    if (user.isAdmin === true) {
      console.log('checkAdminStatus: User is admin (isAdmin flag)');
      return true;
    }

    // For Firebase users, check custom claims
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser && currentUser.email === userEmail) {
      try {
        // Get the ID token result which contains custom claims
        const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh
        console.log('checkAdminStatus: Firebase token claims:', tokenResult.claims);
        
        // Check if user has admin claim (must be explicitly true)
        if (tokenResult.claims.admin === true) {
          console.log('checkAdminStatus: User is admin (Firebase claim)');
          return true;
        }
      } catch (tokenError) {
        // If token refresh fails, continue with other checks
        console.warn('Could not refresh token for admin check:', tokenError);
      }
    }

    console.log('checkAdminStatus: User is NOT admin');
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

