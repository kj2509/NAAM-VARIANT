import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import TextField from "@mui/material/TextField";
import StudentNavbar from "../../components/studentNavbar";
import TeacherNavbar from "../../components/teacherNavbar";
import Center from "../../components/center";
import DrowsinessPieChart from "../../components/graphs/drowsinessPieChart";
import EmotionPieChart from "../../components/graphs/emotionPieChart";
import { apiGetSessionStatsForStudent, apiGetProfilePicUrl } from "../../services/apiService";
import { useParams } from "react-router-dom";
import ReactToPrint from 'react-to-print';
import Button from '@mui/material/Button';

export default function StudentProfile() {
  const componentRef = useRef();
  const user = useSelector((state) => state.user.userData);
  const [student, setStudent] = useState();
  const { studentId } = useParams();
  const profileImage = apiGetProfilePicUrl(studentId);
  const [overallStudentEmotion, setOverallStudentEmotion] = useState('neutral');

  useEffect(() => {
    if (user) {
      getStudentStats(user);
      // getProfileImage();
    }
  }, []);

  const getStudentStats = () => {
    apiGetSessionStatsForStudent(studentId, user).then(
      (res) => {
        setStudent(res.data);
        let emotionMax = 0;
        if(res.data.stats){
          if(res.data.stats.emotion) {
            Object.keys(res.data.stats.emotions).forEach(x => {
              if(res.data.stats.emotions[x] > emotionMax) {
                emotionMax = res.data.stats.emotions[x];
                setOverallStudentEmotion(x);
              }
            });   
          }
        }
      },
      (err) => {
        console.error(err);
      }
    )
  }

  // const getProfileImage = () => {
  //   apiGetCurrentUserProfilePic(user).then(
  //     (res) => {
  //       console.log('res', res)
  //       // setProfileImage(res.data)
  //     },
  //     (err) => {
  //       console.error('Error while fetching profile picture :', err)
  //     }
  //   );
  // }


  return (
    <>
      {user.is_teacher ?
        <TeacherNavbar title="Staff's profile" /> :
        <StudentNavbar title="Profile" />
      }

      <Center>
      <ReactToPrint
          trigger={() => <Button>Print page</Button>}
          content={() => componentRef.current}
        />
        {student &&
          <div className="profile-content-wrapper" ref={componentRef}>
            <div className="profile-image-wrapper">
              <img
                className="profile-image"
                src={profileImage}
                alt="profile-image"
              ></img>
            </div>
            <div className="profile-details-wrapper">
              <p className="profile-id">#{student?.id}</p>
              <h1 className="profile-name">
                <span style={{ fontWeight: "normal" }}>{student?.first_name}</span> {student?.last_name}
              </h1>
              <h2 className="profile-subheading">
                <span>Attendance: </span>
                <span style={{ fontWeight: "bold" }}>{student?.stats.attendance} %</span>
              </h2>
              <h2 className="profile-subheading">
                <span>Overall emotion: </span>
                <span style={{ fontWeight: "bold" }}>{overallStudentEmotion}</span>
              </h2>
              <div className="academic-profile-section">
                <h2 className="profile-subheading">Character Profile</h2>
                <br></br>
                <div className="profile-graphs-section">
                  <div className="profile-graph-section">
                    <h3>Emotion</h3>
                    <div className="graph-image-container">
                      <EmotionPieChart emotion={student?.stats.emotions} />
                    </div>
                  </div>
                  <div className="profile-graph-section">
                    <h3>Drowsiness</h3>
                    <div className="graph-image-container">
                      <DrowsinessPieChart drowsiness={student?.stats.drowsiness} />
                    </div>
                  </div>
                </div>
                <br></br>
              </div>
              {/* <div className="academic-profile-section">
                <h2 className="profile-subheading">Activity Profile</h2>
                <div className="profile-graphs-section">
                  <VoicePieChart />
                </div>
              </div> */}
            </div>
          </div>
        }
      </Center>
    </>
  );
}
