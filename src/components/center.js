import React from "react";

export default function Center(props) {
  return <>
    <div className="center-wrapper">
      {props.children}
    </div>
  </>
}