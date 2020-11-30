import React from "react"
import { Card } from "../components/card"
import { CardLink } from "./CardLink"

export function BookReviewLinks({ books }) {
  return (
    <Card title="Books" className="col-span-2">
      <div>
        {books.map(({ node }) => (
          <CardLink to={node.fields.slug}>{node.frontmatter.title}</CardLink>
        ))}
      </div>
    </Card>
  )
}
