import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Center from "../../components/center";
import StudentNavbar from "../../components/studentNavbar";
import VideoStream from "../../components/videoStream";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import {
  apiJoinSession,
  apiGetSessions
} from "../../services/apiService";
import Footer from "../../components/Footer/Footer";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [activeSession, setActiveSession] = useState();
  const [availableSessions, setAvailableSessions] = useState();
  const [sessionSelectDisabled, setSessionSelectDisabled] = useState(false);

  useEffect(() => {
    if (user?.id) {
      apiGetSessions().then(
        (res) => {
          if (res.data.length != 0) {
            setSessionSelectDisabled(false);
            setAvailableSessions(res.data.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.teacher.first_name}</MenuItem>
            )));
          } else {
            setSessionSelectDisabled(true);
          }
        },
        (err) => {
          console.error(err)
        }
      );
    } else {
      navigate("/")
    }
  }, []);

  const handleJoinSession = () => {
    apiJoinSession(activeSession, user).then(
      (res) => {
        alert("Session joined");
      },
      (err) => {
        console.error(err)
      }
    );
  }

  return (
    <>
      <StudentNavbar title="Meeting Room" />
      <Center>
        <main className="dashboard">
          <center>
            <h3 className="hello-title">Hello, {user.first_name}</h3>
          </center>
          <div>
            <FormControl fullWidth>
              <InputLabel id="select-active-session">Select Meeting</InputLabel>
              <Select
                labelId="select-active-session"
                id="demo-simple-select"
                value={activeSession}
                label="Age"
                onChange={(event) => setActiveSession(event.target.value)}
                disabled={sessionSelectDisabled}
              >
                {availableSessions}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleJoinSession} disabled={sessionSelectDisabled}>Join Session</Button>
          </div>
          <VideoStream />
        </main>
      </Center>
    </>
  );
}
