import React from "react"

export const SideBySideImages = ({ sourceLeft, sourceRight }) => (
  <div style={{ display: "flex", justifyContent: "space-around" }}>
    <div style={{ width: "49%" }}>
      <img src={sourceLeft} style={{ display: "inline-block" }} />
    </div>
    <div style={{ width: "49%" }}>
      <img src={sourceRight} style={{ display: "inline-block" }} />
    </div>
  </div>
)
