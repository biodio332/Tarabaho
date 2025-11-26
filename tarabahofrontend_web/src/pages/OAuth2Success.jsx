import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function OAuth2Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save JWT cookie (7 days)
      Cookies.set('jwtToken', token, { 
        expires: 7, 
        secure: true, 
        sameSite: 'lax' 
      });

      // Optional: also save to localStorage if your app uses it
      localStorage.setItem('jwtToken', token);

      // Small delay so cookie is definitely set
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    } else {
      navigate('/signin?error=oauth_no_token', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Logging you in...</p>
      </div>
    </div>
  );
}