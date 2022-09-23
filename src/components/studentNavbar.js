import React from "react";
import Center from "./center";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import { removeUserSessionFromLocalStorage } from "../services/localStorageService";

export default function Navbar(props) {
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logOut = () => {
    removeUserSessionFromLocalStorage();
    dispatch(logout());
    navigate("/");
  }

  return (
    <>
      <nav className="navbar">
        <Center>
          <div className="nav-inner-wrapper">
            <h3 className="dash-title">{props.title}</h3>
            <div className="nav-right">
              <ul>
                <li><Link to="/staff-dashboard">Meeting</Link></li>
                <li><Link to={`/student/${user.id}`}>Profile</Link></li>
                <li><Link to="/" onClick={logOut}>Logout</Link></li>
              </ul>
            </div>
          </div>
        </Center>
      </nav>
    </>
  );
}
