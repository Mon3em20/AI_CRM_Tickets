import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch current user on app load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/auth/me", {
                    withCredentials: true,
                });
                setUser(res.data.user);
                setAuthenticated(true);
            } catch(e) {
                console.log(e);
                setUser(null);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        // Check if user was previously authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Register function
    const register = async (userData) => {
        try {
            console.log("before post register");
            const response = await axios.post("http://localhost:3000/api/auth/register", userData, {
                withCredentials: true,
            });
            console.log("after post register");

            if (response.data && response.data.user) {
                // Store user data in context
                setUser(response.data.user);
                setAuthenticated(true);
                console.log(response.data);

                localStorage.setItem('isAuthenticated', 'true');
                toast.success("Registration successful!");

                return {
                    success: true,
                    user: response.data.user
                };
            }

            return {
                success: false,
                error: "Registration failed"
            };
        } catch (err) {
            console.error(err);
            
            return {
                success: false,
                error: err.response?.data?.message || "Registration failed"
            };
        }
    };

    // Login function
    const login = async (credentials) => {
        try {
            console.log("before post login");
            const response = await axios.post("http://localhost:3000/api/auth/login", credentials, {
                withCredentials: true,
            });
            console.log("after post login");

            if (response.data && response.data.user) {
                // Store user data in context
                setUser(response.data.user);
                setAuthenticated(true);
                console.log(response.data);

                localStorage.setItem('isAuthenticated', 'true');
                toast.success("Login successful!");

                return {
                    success: true,
                    user: response.data.user
                };
            }

            return {
                success: false,
                error: "Login failed"
            };
        } catch (err) {
            console.error(err);

            return {
                success: false,
                error: err.response?.data?.message || "Login failed"
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout', {}, {
                withCredentials: true
            });

            // Clear user from context
            setUser(null);
            setAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            toast.success("Logged out successfully");

            return { success: true };
        } catch (error) {
            toast.error("Logout failed. Please try again.");

            console.error("Logout error:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Error logging out"
            };
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ 
            user, 
            authenticated, 
            register, 
            login, 
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
