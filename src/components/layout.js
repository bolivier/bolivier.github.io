import React from "react"
import { Link } from "gatsby"

import { rhythm } from "../utils/typography"

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`

    const showBigHeader =
      location.pathname === rootPath ||
      location.pathname === rootPath + "recipes"

    let header

    if (showBigHeader) {
      header = (
        <h1
          className="name-header text-5xl font-extrabold text-emphasis"
          style={{
            marginBottom: rhythm(1.5),
          }}
        >
          <Link style={linkStyle} to={`/`}>
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          className="text-3xl font-extrabold text-gray-700 mt-0 hover:underline"
          style={{
            fontFamily: `Montserrat, sans-serif`,
          }}
        >
          <Link style={linkStyle} to={`/`}>
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "2rem",
        }}
      >
        <header>{header}</header>
        <main
          style={{
            width: "65%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {children}
        </main>
        <footer style={{ marginTop: "3rem" }}>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

const linkStyle = {
  boxShadow: `none`,
  textDecoration: `none`,
  fontFamily: `Montserrat, sans-serif`,
}

export default Layout
