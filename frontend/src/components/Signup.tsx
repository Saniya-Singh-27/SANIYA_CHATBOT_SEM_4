import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.signup(formData);
      navigate('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // FastAPI validation error
          setError(detail.map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', '));
        } else {
          setError(detail);
        }
      } else {
        setError('An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-pink-50">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Left Side - Image/Illustration */}
          <div className="hidden w-1/2 bg-pink-100 p-12 lg:block">
            <div className="relative h-full w-full">
              <img 
                src="https://img.freepik.com/free-vector/modern-woman-wheelchair-drinking-coffee_23-2148204654.jpg" 
                alt="Illustration" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full p-12 lg:w-1/2">
            <h2 className="mb-8 text-3xl font-bold text-slate-800">Signup</h2>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="username"
                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="email"
                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="password"
                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-full bg-black py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-black hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
