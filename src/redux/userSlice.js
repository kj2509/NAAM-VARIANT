import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  userData: {}
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = {};
    },
    default: (state) => state,
  }
})

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
