import React from "react"
import { graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Card } from "../components/card"
import { BookReviewLinks } from "../components/BookReviewLinks"
import { CardLink } from "../components/CardLink"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges
    const adventPosts = data.adventPosts.edges
    const books = data.books.edges

    const tags = organizePostsByTag(posts)

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="All posts" />
        <Bio location={this.props.location} />

        <div className="grid grid-cols-2 grid gap-5">
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
                        <CardLink to={node.fields.slug}>
                          {node.frontmatter.title}
                        </CardLink>
                      </li>
                    </React.Fragment>
                  ))}
                </Card>
              )
            })}
          <BookReviewLinks books={books} />
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
    adventPosts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/(advent-2020)/.*\\\\.md$/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }

    books: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/(books)/.*\\\\.md$/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
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
    node.frontmatter.tags?.forEach(tag => {
      if (!tags[tag]) {
        tags[tag] = []
      }
      tags[tag].push(post)
    })
  })
  return tags
}
