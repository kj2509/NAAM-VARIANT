import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  values: []
}

export const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    addStudentData: (state, action) => {
      state.values.push(action.payload)
    },
    setStudentsData: (state, action) => {
      state.values = action.payload;
    },
    default: (state) => state,
  }
})

export const { addStudentData, setStudentsData } = studentsSlice.actions;

export default studentsSlice.reducer;