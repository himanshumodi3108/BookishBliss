import config from '../config/config';
import { getAuth } from 'firebase/auth';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${config.API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Check for JWT token first (from localStorage)
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      // Fall back to Firebase token
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      }
    }

    const configOptions = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, configOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        // Attach status code to error for easier handling
        error.status = response.status;
        // Only log non-404 errors to reduce console noise
        if (response.status !== 404) {
          console.error('API request failed:', error);
        }
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      // Only log if it's not a 404 and not already logged
      if (error.status !== 404 && !error.message?.includes('HTTP error! status: 404')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiClient();

