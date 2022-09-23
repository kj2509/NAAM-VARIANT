import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdVideocam, MdVideocamOff, MdMic, MdMicOff } from "react-icons/md";
import { io } from "socket.io-client";

export default function VideoStream() {
  const user = useSelector((state) => state.user.userData);
  const [streamOngoing, setStreamOngoing] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const startStream = () => {
    var video = document.querySelector("#webcam-stream");

    video.height = 480;
    video.width = 640;

    if (navigator.mediaDevices.getUserMedia) {

      var socket = io('http://127.0.0.1:5000/');

      socket.on('connect', () => {
        console.log('Socket connection established...');
      })

      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
          video.play();
          setStreamOngoing(true);

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          var type = "image/png"
          let img = canvas.toDataURL(type);
          img = img.replace('data:' + type + ';base64,', '');
          let data = {
            image: img,
            user_id: user.id
          }
          socket.emit('image', data);

          const FPS = 10;

          setInterval(() => {
            canvas.height = video.height;
            canvas.width = video.width;
            ctx.drawImage(video, 0, 0);

            let img = canvas.toDataURL(type);
            img = img.replace('data:' + type + ';base64,', '');
            let data = {
              image: img,
              user_id: user.id
            }
            socket.emit('image', data);
          }, 10000 / FPS);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  const stopStream = () => {

    var video = document.querySelector("#webcam-stream");

    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }

    video.srcObject = null;
    setStreamOngoing(false);
  }

  const startMic = () => {
    navigator.mediaDevices.getUserMedia({ audio: false });
    setMicOn(!micOn)
  }

  const stopMic = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
    setMicOn(!micOn)
  }

  useEffect(() => {
    startStream();
  }, []);

  return <>
    <center>
      <div className="videoContainer">
        <canvas id="canvasOutput"></canvas>
        <p className="subtitle"> <b>LIVE</b> WEBCAM STREAM</p>
        <video id="webcam-stream" autoPlay>
        </video>
      </div>
      {/* <div className="stream-container">
        <div className='video'>
          <p className="subtitle"> <b>PROCESSED</b> WEBCAM STREAM (AWAKE)</p>
          <img height="300px" width="450px" id="image" />
        </div>

        <div className='video'>
          <p className="subtitle"> <b>PROCESSED</b> WEBCAM STREAM (EMOTION DETECTION)</p>
          <img height="300px" width="450px" id="image1" />
        </div>
      </div> */}
      <div className="control-buttons">
        {streamOngoing ?
          <button className="stream-button" onClick={stopStream}><MdVideocamOff /></button> :
          <button className="stream-button" onClick={startStream}><MdVideocam /></button>
        }
        {micOn ?
          <button className="stream-button" onClick={startMic}><MdMicOff /></button> :
          <button className="stream-button" onClick={stopMic}><MdMic /></button>
        }
      </div>
    </center>
  </>
}
