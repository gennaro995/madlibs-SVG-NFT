import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";


const Popup = (props, param) => {
  const { currentTheme } = useThemeSwitcher();

  return (
    <div           style={{   color: currentTheme === "light" ? "#222222" : "white" }}    className="popup-box">
      <div className="box" id={"popup_box"}  style={{ background: currentTheme==="light" ? 'white':'#212121'}}>
        <span className="close-icon" onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
  );
};

export default Popup;