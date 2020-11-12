import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

class RecipesIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="recipes" />
        <Bio />
        <div>
          <p>
            These recipes are mostly just for my own reference, and are written
            in a pretty abbreviated style.
          </p>
        </div>
        <div>
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <article key={node.fields.slug}>
                <header>
                  <h3
                    style={{
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </h3>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </article>
            )
          })}
        </div>
      </Layout>
    )
  }
}

export default RecipesIndex

const regexp = "/(recipes)/.*\\\\.md$/"
export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/(recipes)/.*\\\\.md$/" } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
