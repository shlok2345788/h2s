import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('apiKey');
      localStorage.removeItem('instituteName');
      localStorage.removeItem('userEmail');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">Q</span>
          <span>Question Analyzer</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {!user ? (
            <Link to="/auth" className="nav-link nav-link--primary">
              Sign in with Google
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/analyze" className="nav-link nav-link--primary">
                Analyze Questions
              </Link>
              <Link to="/bulk" className="nav-link">
                Bulk Analyzer
              </Link>
              <Link to="/apikeys" className="nav-link">
                API Keys
              </Link>
              <Link to="/docs" className="nav-link">
                Developer Docs
              </Link>
              <button
                className="nav-link nav-link--secondary"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
