import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await authApi.login(formData);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('username', formData.username);
      navigate('/chat');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', '));
        } else {
          setError(detail);
        }
      } else {
        setError('Incorrect username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Left Side - Image/Illustration */}
          <div className="hidden w-1/2 bg-blue-50 p-12 lg:block">
            <div className="relative h-full w-full">
              <img 
                src="https://img.freepik.com/free-vector/couple-professionals-analyzing-data_23-2148534142.jpg" 
                alt="Illustration" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full p-12 lg:w-1/2">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-800">Login</h2>
            {error && <div className="mb-4 text-sm text-red-500 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-8">
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
                className="mt-8 w-full rounded-md bg-[#2d3748] py-3 font-semibold text-white transition-all hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-black hover:underline">
                Signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
