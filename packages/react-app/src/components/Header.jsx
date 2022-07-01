import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader
        title={<div style={{ marginLeft: 10 }}>Car Certification onChain</div>}
        subTitle="A simple implementation on how to use ERC721 as car documentation history"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
