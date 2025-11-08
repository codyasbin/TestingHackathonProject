import {createSlice} from "@reduxjs/toolkit";

const id = sessionStorage.get("id");
const initialState = {isAuthenticated: !!id};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {setAuthState} = authSlice.actions;
export default authSlice.reducer;
