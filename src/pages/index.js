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

    const december2020CalendarDays = [null, null, ...range(1, 26), null, null]

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="All posts" />
        <Bio location={this.props.location} />
        <Card title="Advent of Code 2020" style={{ marginBottom: "1rem" }}>
          <div className="advent-of-code-grid">
            {december2020CalendarDays.map(day => (
              <div>{day}</div>
            ))}
          </div>
        </Card>

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

function range(start, end) {
  let result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

function partition(n, coll) {
  let input = coll
  let result = []
  while (input.length > 0) {
    console.log(input)
    result.push(input.slice(0, n))
    input = input.slice(n)
  }
  if (result[result.length - 1].length !== n) {
    result.splice(result.length - 1, 1)
  }
  return result
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
