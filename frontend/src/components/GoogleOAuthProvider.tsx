import React, { ReactNode } from 'react';
import { GOOGLE_OAUTH_CLIENT_ID } from '../config/firebase';

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

export const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({ children }) => {
  React.useEffect(() => {
    // Load Google API script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_OAUTH_CLIENT_ID,
            callback: () => {
              // Callback handled by Firebase
            },
          });
        }
      };
    }
  }, []);

  return <>{children}</>;
};

// Extend window object to include google types
declare global {
  interface Window {
    google?: any;
  }
}
