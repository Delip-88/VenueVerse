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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  const [logoutUser] = useMutation(LOGOUT_USER);

  // Handle authentication state
  useEffect(() => {
    if (data?.me) {
      setIsAuthenticated(true);
      setUser(data.me);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [data]);

  // Function to handle user logout
  const logout = async () => {
    try {
      const response = await logoutUser();
      const { message, success } = response.data?.logout || {};

      if (success) {
        // Reset Apollo cache on logout to prevent showing old data
        await client.resetStore();

        // Update client-side auth state
        setIsAuthenticated(false);
        setUser(null);

        // Redirect to home page
        window.location.href = "/";
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
        setIsAuthenticated,
        user,
        setUser,
        loading,
        error,
        CLOUD_NAME,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
