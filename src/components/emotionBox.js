import React from "react";
import {BiHappy} from "react-icons/bi"

export default function EmotionBox(){
    return <>
        <div className="emotion-box-wrapper">
            <div className="emotion-content">
                <BiHappy />
                <h4>Happy</h4>
            </div>
        </div>
    </>
}