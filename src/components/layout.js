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
          className="name-header"
          style={{
            marginBottom: rhythm(1.5),
            marginTop: 0,
            color: "#40407a",
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
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
            width: "70%",
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

export default Layout
