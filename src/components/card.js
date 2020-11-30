import React from "react"

export function Card({ children, title, style = {} }) {
  return (
    <div
      style={{
        flex: "40%",
        padding: "5px",
        borderRadius: "3px",
        boxShadow: "1px 1px 2px 0px",
        background: "#f8f8f8",
        ...style,
      }}
    >
      <div>
        <h2 className="text-2xl underline mb-2">{title}</h2>
        <div style={{ textAlign: "left" }}>{children}</div>
      </div>
    </div>
  )
}
