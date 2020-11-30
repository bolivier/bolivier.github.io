const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const blogRegexp = "/(blog)/.*\\\\.md$/"
const recipesRegexp = "/(recipes)/.*\\\\.md$/"
const adventRegexp = "/(advent-2020)/.*\\\\.md$/"

function createOrderedContent(createPage, pages, component) {
  pages.forEach((page, index) => {
    const previous = index === pages.length - 1 ? null : pages[index + 1].node
    const next = index === 0 ? null : pages[index - 1].node
    const {
      node: {
        fields: { slug },
      },
    } = page

    return createPage({
      path: slug,
      component,
      context: {
        slug,
        previous,
        next,
      },
    })
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const recipePost = path.resolve(`./src/templates/recipe-post.js`)
  const blogResult = await graphql(createPageQueryString(blogRegexp))
  const recipeResult = await graphql(createPageQueryString(recipesRegexp))
  const adventResult = await graphql(createPageQueryString(adventRegexp))

  const results = [blogResult, recipeResult, adventResult]
  results.forEach(res => {
    if (res.errors) {
      throw res.errors
    }
  })

  // Create blog posts pages.
  const posts = blogResult.data.allMarkdownRemark.edges
  createOrderedContent(createPage, posts, blogPost)

  const recipes = recipeResult.data.allMarkdownRemark.edges
  createOrderedContent(createPage, recipes, recipePost)

  const adventPosts = adventResult.data.allMarkdownRemark.edges
  createOrderedContent(createPage, adventPosts, blogPost)
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    let value = createFilePath({ node, getNode })
    if (value.startsWith("/blog")) {
      value = value.replace("/blog", "/posts")
    }
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

function createPageQueryString(regexp) {
  return `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter:{fileAbsolutePath: {regex: "${regexp}"}}
          limit: 1000
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
      }
    `
}
