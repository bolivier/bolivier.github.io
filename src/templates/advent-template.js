import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { MDXRenderer } from "gatsby-plugin-mdx"

class AdventTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article>
          <header>
            <h1
              className="text-5xl font-bold text-emphasis"
              style={{
                fontFamily: "Montserrat, sans-serif",
                marginTop: rhythm(1),
              }}
            >
              {post.frontmatter.date}
            </h1>
          </header>
          <h3 className="text-xl text-primary mt-3 font-extrabold">Preface</h3>
          <p>
            I'm doing writeups for the Advent of Code 2020 in Clojure. This is
            mostly to motivate me, but if you like it, that's cool too.
          </p>
          <p>
            All the code is on{" "}
            <Link href="https://github.com/bolivier/advent-of-code-2020">
              my Github
            </Link>
          </p>
          <MDXRenderer>{post.body}</MDXRenderer>
          <hr
            style={{
              marginBottom: rhythm(1),
            }}
          />
        </article>
      </Layout>
    )
  }
}

export default AdventTemplate

export const pageQuery = graphql`
  query AdventBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
