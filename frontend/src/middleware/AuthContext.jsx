import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { Cloudinary } from "@cloudinary/url-gen";
import { createContext, useEffect, useState } from "react";
import ME_QUERY from "../components/Graphql/query/meGql";
import LOGOUT_USER from "../components/Graphql/mutations/logoutGql";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

  // Initialize Cloudinary instance
  const CID = new Cloudinary({
    cloud: { cloudName: CLOUD_NAME },
  });

  // Apollo client instance
  const client = useApolloClient();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken") // Check if token exists
  );
  const [user, setUser] = useState(null);

  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    skip: !isAuthenticated && !localStorage.getItem("authToken"), // Allow refetch if token exists
  });

  const [logoutUser] = useMutation(LOGOUT_USER);

  // Handle authentication state
  useEffect(() => {
    if (isAuthenticated && data?.me) {
      setIsAuthenticated(true);
      setUser(data.me);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [data]);

  // Function to store token and update user state after login
  const login = async (token) => {
    localStorage.setItem("authToken", token); // Store token
    setIsAuthenticated(true);

    const { data } = await refetch(); // Fetch user data after authentication

    if (data?.me) {
      setUser(data.me); // Set user state after fetching data
    }
  };


  // Function to handle user logout
  const logout = async () => {
    try {
      const response = await logoutUser();
      const { success } = response.data?.logout || {};

      if (success) {
        // Remove token and reset state
        localStorage.removeItem("authToken");
        await client.resetStore();
        setIsAuthenticated(false);
        setUser(null);

        window.location.href = "/"; // Redirect to home page
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        CID,
        isAuthenticated,
        user,
        loading,
        error,
        CLOUD_NAME,
        login, // Provide login function
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
