const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export const getToken = () =>
  localStorage.getItem("token");

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");

  window.location.href = "/";
};

export const authFetch = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  try {
    return await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to backend."
    );
  }
};

export const authJsonFetch =
  async (
    endpoint,
    options = {}
  ) =>
    authFetch(
      endpoint,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),
        },
      }
    );

export const getErrorMessage =
  async (
    response
  ) => {

    try {

      const data =
        await response.json();

      return (
        data.message ||
        data.error ||
        `Request failed (${response.status}).`
      );

    } catch {

      return `Request failed (${response.status}).`;
    }
  };