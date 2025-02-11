import { useContext, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { AuthContext } from "../../middleware/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import LOGIN_USER from "../../components/Graphql/mutations/loginGql";


const LoginPage = () => {
  const { isAuthenticated, user,login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid";
    if (!password) errors.password = "Password is required";
    // else if (password.length < 6)
    //   errors.password = "Password must be at least 6 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [LOGIN, { data }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      console.log("Login successful:", data);
      setLoading(false);

      // Handle successful login (e.g., store token, redirect)
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setLoading(false);
      setError(error);
      setFormErrors({
        general: "Login failed. Please check your credentials.",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return; // Prevent invalid submission
    setLoading(true);
  
    try {
      const { data } = await LOGIN({ variables: { email, password } });
      const token = data?.login; // Get JWT token
  
      if (token) {
        await login(token); // Store token and refetch user data
      window.location.href="/Dashboard"

      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {formErrors.general && (
            <div className="text-sm text-red-600 text-center">
              {formErrors.general}
            </div>
          )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="mt-4 flex items-center justify-between">
        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
          Forgot password?
        </Link>
        <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-800">
          Sign up
        </Link>
      </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
