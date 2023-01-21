import React from "react";

const Popup = (props, param) => {
  {console.log("aaaaaa",props.param)}
  return (
    <div className="popup-box">
      <div className="box" id={"popup_box"+props.param}>
        <span className="close-icon" onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
  );
};

export default Popup;