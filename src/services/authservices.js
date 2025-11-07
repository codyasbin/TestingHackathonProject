import Cookies from "js-cookie";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getAccessToken = () => Cookies.get("accessToken");

export const authService = {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/auth/register/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.map((e) => e.detail).join(" ") || "Registration failed");
      }
      return data;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  },

  /** Login */
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/auth/login/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.map((e) => e.detail).join(" ") || "Login failed");
      }
      return data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  },
  /** Get Profile */
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/auth/profile/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        window.location.href = "/auth";
        toast.error("Please login again", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
      return data; // { id, first_name, last_name, username, email, role, phone }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
  async updateProfile(ProfileData) {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(ProfileData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors.map((e) => e.detail).join(" ") || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};
