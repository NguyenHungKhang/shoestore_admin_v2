export const login = (userData) => ({
  type: "LOGIN",
  payload: userData,
});

export const logout = () => ({
  type: "LOGOUT",
});

export const updateUser = (userData) => ({
  type: "UPDATE_USER",
  payload: userData,
});
