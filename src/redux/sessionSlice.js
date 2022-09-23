import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessionId: null,
  sessionDetails: [],
  allSession: []
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setActiveSessionDetails: (state, action) => {
      state.sessionDetails = action.payload;
    },
  }
})

export const { setActiveSessionId, setActiveSessionDetails } = sessionSlice.actions;

export default sessionSlice.reducer;