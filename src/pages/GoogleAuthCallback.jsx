import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (code) {
      // Send the authorization code back to the opener window
      window.opener.postMessage(
        {
          type: 'GOOGLE_OAUTH2_CALLBACK',
          code
        },
        window.location.origin
      );
    } else if (error) {
      // Send the error back to the opener window
      window.opener.postMessage(
        {
          type: 'GOOGLE_OAUTH2_CALLBACK',
          error
        },
        window.location.origin
      );
    }

    // Close this window
    window.close();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Completing Google Calendar authorization...</p>
    </div>
  );
};

export default GoogleAuthCallback;