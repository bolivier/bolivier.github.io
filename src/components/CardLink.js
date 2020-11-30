import { Link } from "gatsby"
import React from "react"

export function CardLink({ to, children }) {
  return (
    <Link className="text-xs mr-1 underline shadow-none text-blue-800" to={to}>
      {children}
    </Link>
  )
}
