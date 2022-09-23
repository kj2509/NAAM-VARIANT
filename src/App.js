import { BrowserRouter, Routes, Route, Redirect } from "react-router-dom";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentsMark from "./pages/StudentsMark";
import StudentProfile from "./pages/StudentProfile";
import Protected from "./components/protected";
import { useSelector } from "react-redux";
import LoginWrapper from "./components/LoginWrapper";
import Footer from "./components/Footer/Footer";

function App() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  return (
    <>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginWrapper><Login /> </LoginWrapper>} />
          <Route path="/create-user" element={<LoginWrapper><CreateUser /></LoginWrapper>} />
          <Route path="/student/:studentId" element={
            <Protected isLoggedIn={isLoggedIn}>
              <StudentProfile />
            </Protected>
          } />
          <Route path="/staff-dashboard" element={
            <Protected isLoggedIn={isLoggedIn}>
              <StudentDashboard />
            </Protected>
          } />
          <Route path="/manager-dashboard" element={
            <Protected isLoggedIn={isLoggedIn}>
              <TeacherDashboard />
            </Protected>
          } />
          <Route path="/reports" element={
            <Protected isLoggedIn={isLoggedIn}>
              <StudentsMark />
            </Protected>
          } />
        </Routes>
      </BrowserRouter>
    </div>
    <Footer />
    </>
  );
}

export default App;
