import React from "react";
import Center from "./center";
import Navbar from "../components/Navbar";
import EmotionStream from "../components/VideoStream";

export default function EmotionDetection() {

  return <>
    <Navbar title="Emotion Detection" />
    <Center>
      <main className="dashboard">
        <EmotionStream />
      </main>
    </Center>
  </>
}