import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title={<div style={{ marginLeft: 10 }}>MadLibs on Chain</div>}
        subTitle="A simple implementation on how to use ERC721 as a MadLibs based game"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
