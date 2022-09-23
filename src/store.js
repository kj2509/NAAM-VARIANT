import { configureStore } from "@reduxjs/toolkit";
import userSlice from './redux/userSlice';
import studentsSlice from './redux/studentsSlice';
import sessionSlice from "./redux/sessionSlice";

export default configureStore({
  reducer: {
    user: userSlice,
    students: studentsSlice,
    session: sessionSlice
  },
});