import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { Card } from "../components/card"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges

    const tags = organizePostsByTag(posts)

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="All posts" />
        <Bio location={this.props.location} />
        <div
          style={{
            flex: "40%",
            padding: "5px",
            borderRadius: "3px",
            boxShadow: "1px 1px 2px 0px",
            background: "#f8f8f8",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                marginBottom: "0.5rem",
                marginTop: 0,
                textDecoration: "underline",
              }}
            >
              Advent of Code 2020
            </h2>
            <div style={{ textAlign: "left" }}>
              {posts.map(({ node }) => (
                <React.Fragment>
                  <li style={{ display: "inline" }}>
                    <Link
                      style={{
                        marginRight: "0.5rem",
                        boxShadow: "none",
                        fontSize: "10px",
                        textDecoration: "underline",
                      }}
                      to={node.fields.slug}
                    >
                      {node.frontmatter.title}
                    </Link>
                  </li>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexFlow: "row wrap", gap: "15px" }}>
          {Object.entries(tags)
            .sort((a, b) => {
              return a[0].charCodeAt(0) - b[0].charCodeAt(0)
            })
            .map(([tag, posts]) => {
              return (
                <Card title={capitalize(tag)}>
                  {posts.map(({ node }) => (
                    <React.Fragment>
                      <li style={{ display: "inline" }}>
                        <Link
                          style={{
                            marginRight: "0.5rem",
                            boxShadow: "none",
                            fontSize: "10px",
                            textDecoration: "underline",
                          }}
                          to={node.fields.slug}
                        >
                          {node.frontmatter.title}
                        </Link>
                      </li>
                    </React.Fragment>
                  ))}
                </Card>
              )
            })}
        </div>
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/(blog)/.*\\\\.md$/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
          }
        }
      }
    }
  }
`
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}

function organizePostsByTag(posts) {
  const tags = {}
  posts.forEach(post => {
    const { node } = post
    node.frontmatter.tags.forEach(tag => {
      if (!tags[tag]) {
        tags[tag] = []
      }
      tags[tag].push(post)
    })
  })
  return tags
}
