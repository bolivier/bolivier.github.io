import { graphql } from "gatsby"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

export default function BookNotesTemplate({ data, location }) {
  const bookNotes = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={bookNotes.frontmatter.title}
        description={bookNotes.frontmatter.description || bookNotes.excerpt}
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
            {bookNotes.frontmatter.title}
          </h1>
          <p>
            <span>by </span>
            <span className="italic">{bookNotes.frontmatter.authorName}</span>
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: bookNotes.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
      </article>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BookNotestBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        authorName
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
