import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import Center from "../../components/center";
import TeacherNavbar from "../../components/teacherNavbar";
import MarksBarChart from "../../components/graphs/marksBarChart";
import AttendanceBarChart from "../../components/graphs/attendanceBarChart";
import DrowsinessPieChart from "../../components/graphs/drowsinessPieChart";
import EmotionPieChart from "../../components/graphs/emotionPieChart";
import {
  apiCreateSession, apiEndSession, apiGetSessions,
  apiStudentsDataForAllSessions,
  apiGetActiveSessionDetails,
  apiAllStudentsDataForActiveSession,
  apiGetEntireSessionForTeacher,
  apiGetProfilePicUrl
} from "../../services/apiService";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { getConsolidatedStudentEmotions, getConsolidatedStudentDrowsiness } from "../../services/graphDataService";
import { setActiveSessionId, setActiveSessionDetails } from "../../redux/sessionSlice";
import { setStudentsData } from "../../redux/studentsSlice";
import PersonIcon from '@mui/icons-material/Person';
import ReactToPrint from 'react-to-print';
import "./teacherDashboard.css";
import Footer from "../../components/Footer/Footer";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const componentRef = useRef();
  const user = useSelector((state) => state.user.userData);
  const [sessionId, setSessionId] = useState();
  const [sessionStarted, setSessionStarted] = useState();
  const [activeSessionData, setActiveSessionData] = useState();
  const [allSessionsData, setAllSessionsData] = useState();
  const [activeSessionEmotion, setActiveSessionEmotion] = useState();
  const [allSessionEmotion, setAllSessionEmotion] = useState();
  const [activeSessionDrowsiness, setActiveSessionDrowsiness] = useState();
  const [allSessionDrowsiness, setAllSessionDrowsiness] = useState();
  const [activeStudents, setActiveStudents] = useState();
  const [selectedSession, setSelectedSession] = useState();
  const [selectedSessionStudents, setSelectedSessionStudents] = useState();
  const [completeTeacherSessions, setCompleteTeacherSessions] = useState();
  const [completeTeacherSessionsMenu, setCompleteTeacherSessionsMenu] = useState();

  useEffect(() => {
    apiGetSessions().then(
      (res) => {
        const sessionList = res.data;
        if (sessionList) {
          const index = sessionList.findIndex(x => x.user_id == user.id);
          if (index >= 0) {
            setSessionStarted(true);
            setSessionId(sessionList[index].id);
            dispatch(setActiveSessionId(sessionList[index].id));
            getStudentsDataForActiveSession(sessionList[index].id);
          } else {
            setSessionStarted(false);
          }
        }
      },
      (err) => {
        console.error(err)
      }
    );
  }, []);


  useEffect(() => {
    getStudentsDataForAllSessions();
    getDataForEntireSessionsForTeacher();
    if (sessionStarted && sessionId) {
      getStudentsDataForActiveSession();
    }
    // let timer1 = setTimeout(() => {
    //   getStudentsDataForAllSessions();
    //   if (sessionStarted) {
    //     getStudentsDataForActiveSession();
    //   }
    // }, 10000);
    // return () => {
    //   clearTimeout(timer1);
    // };
  }, []);

  const handleStartSession = () => {
    apiCreateSession(user).then(
      (res) => {
        setSessionStarted(true);
        dispatch(setActiveSessionId(res.data.id));
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const handleStopSession = () => {
    apiEndSession(user).then(
      (res) => {
        setSessionStarted(false);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const getStudentsDataForAllSessions = () => {
    apiStudentsDataForAllSessions(user).then(
      (res) => {
        setAllSessionsData(res.data);
        dispatch(setStudentsData(res.data));
        dispatch(setActiveSessionDetails(res.data));
        const consolidatedAllSessionEmotion = getConsolidatedStudentEmotions(res.data);
        const consolidatedAllSessionDrowsiness = getConsolidatedStudentDrowsiness(res.data);
        setAllSessionEmotion(consolidatedAllSessionEmotion);
        setAllSessionDrowsiness(consolidatedAllSessionDrowsiness);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const getDataForEntireSessionsForTeacher = () => {
    apiGetEntireSessionForTeacher(user).then(
      (res) => {
        setCompleteTeacherSessions(res.data);
        let content = [];
        res.data.forEach(session => {
          content.push(
            <MenuItem key={`men-${session.id}`} value={session.id}>{session.start_time}</MenuItem>
          )
        });
        setCompleteTeacherSessionsMenu(content);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const getStudentsDataForActiveSession = (id) => {
    apiGetActiveSessionDetails(user, id).then(
      (res) => {
        dispatch(setActiveSessionDetails(res.data));
        setActiveStudents(res.data.students_list);
      },
      (err) => {
        console.error(err)
      }
    );
    apiAllStudentsDataForActiveSession(user).then(
      (res) => {
        setActiveSessionData(res.data);
        const consolidatedActiveSessionEmotion = getConsolidatedStudentEmotions(res.data);
        const consolidatedActiveSessionDrowsiness = getConsolidatedStudentDrowsiness(res.data);
        setActiveSessionEmotion(consolidatedActiveSessionEmotion);
        setActiveSessionDrowsiness(consolidatedActiveSessionDrowsiness);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const handleSessionSelect = (e) => {
    const selSession = completeTeacherSessions.filter(x => x.id == e.target.value)[0];
    setSelectedSessionStudents(selSession.students);
  }

  return (
    <>
      <TeacherNavbar title="Manager's Dashboard" />
      <Center>
        <ReactToPrint
          trigger={() => <Button>Print page</Button>}
          content={() => componentRef.current}
        />
        <main className="dashboard"  ref={componentRef}>
          <center>
            <h3 className="hello-title">Welcome, {user.first_name}</h3>
          </center>
          <div className="td-root-graphs-container">
            <div className="td-session-button-container">
              {sessionStarted ?
                <Button variant="contained" onClick={handleStopSession}>Stop Session</Button> :
                <Button variant="contained" onClick={handleStartSession}>Start Session</Button>
              }
            </div>

            {sessionStarted && (activeSessionEmotion || activeSessionDrowsiness) &&
              <div className="td-graph-section">
                <h2>Active Session</h2>
                <div className="graphs-container">
                  {activeSessionEmotion &&
                    <div className="graph-container">
                      <h3>Emotion</h3>
                      <div className="graph-image-container">
                        <EmotionPieChart emotion={activeSessionEmotion} />
                      </div>
                    </div>
                  }
                  {activeSessionDrowsiness &&
                    <div className="graph-container">
                      <h3>Drowsiness</h3>
                      <div className="graph-image-container">
                        <DrowsinessPieChart drowsiness={activeSessionDrowsiness} />
                      </div>
                    </div>
                  }
                </div>
                <br></br>
                  <Card className="student-list">
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Attendance
                      </Typography>
                      <List>
                        {activeStudents?.length > 0 ?
                          activeStudents.map(student => {
                            return (
                              <>
                                <ListItem key={`act-${student.id}`}>
                                  <ListItemAvatar key={`lsavt-${student.id}`}>
                                    <Avatar key={`avt-${student.id}`}>
                                      {/* <PersonIcon /> */}
                                      <img src={apiGetProfilePicUrl(student.id)}/>
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary={student.first_name + " " + student.last_name} />
                                </ListItem>
                              </>
                            )
                          }) :
                          <span>No students joined session</span>
                        }
                      </List>
                    </CardContent>
                  </Card>
              </div>
            }

            <div className="td-graph-section">
              <h2>Previous Sessions</h2>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Select session</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedSession}
                  label="Age"
                  onChange={(e) => handleSessionSelect(e)}
                >
                  {completeTeacherSessionsMenu}
                </Select>
              </FormControl>
              {selectedSessionStudents &&
                <>
                  <div className="graphs-container">
                    <div className="graph-container">
                      {allSessionEmotion &&<> <h3>Emotion</h3> <div className="graph-image-container"><EmotionPieChart emotion={allSessionEmotion} /></div></>}
                    </div>
                    <div className="graph-container">
                      {allSessionDrowsiness &&<> <h3>Drowsiness</h3> <div className="graph-image-container"><DrowsinessPieChart drowsiness={allSessionDrowsiness} /></div></>}
                    </div>
                  </div>
                  <br></br>
                  <Card className="student-list">
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Attendance
                      </Typography>
                      <List>
                        {selectedSessionStudents.length > 0 ?
                          selectedSessionStudents.map(student => {
                            return (
                              <>
                                <ListItem key={`prev${student.id}`}>
                                  <ListItemAvatar key={`prev-ls${student.id}`}>
                                    <Avatar key={`prev-avt${student.id}`}>
                                      {/* <PersonIcon /> */}
                                      <img src={apiGetProfilePicUrl(student.id)}/>
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary={student.first_name + " " + student.last_name} />
                                </ListItem>
                              </>
                            )
                          }) :
                          <span>No students joined session</span>
                        }
                      </List>
                    </CardContent>
                  </Card>
                </>
              }
            </div>

            <div className="td-graph-section">
              <h2>Cumulative Sessions</h2>
              <div className="graphs-container">
                <div className="graph-container">
                  {allSessionEmotion && <><h3>Emotion</h3> <div className="graph-image-container"><EmotionPieChart emotion={allSessionEmotion} /></div></>}
                </div>
                <div className="graph-container">
                  {allSessionDrowsiness && <><h3>Drowsiness</h3><div className="graph-image-container"><DrowsinessPieChart drowsiness={allSessionDrowsiness} /></div></>}
                </div>
              </div>
            </div>
            <br />
            <div className="graphs-container">
              <div className="graph-container">
                {allSessionsData && <><h3>Attendance</h3><AttendanceBarChart students={allSessionsData} /></>}
              </div>
            </div>
          </div>
        </main>
      </Center>
    </>
  );
}