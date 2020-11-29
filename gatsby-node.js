const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const blogRegexp = "/(blog)/.*\\\\.md$/"
const recipesRegexp = "/(recipes)/.*\\\\.md$/"

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

  if (blogResult.errors) {
    throw blogResult.errors
  }
  if (recipeResult.errors) {
    throw recipeResult.errors
  }

  // Create blog posts pages.
  const posts = blogResult.data.allMarkdownRemark.edges
  const recipes = recipeResult.data.allMarkdownRemark.edges
  createOrderedContent(createPage, posts, blogPost)
  createOrderedContent(createPage, recipes, recipePost)
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
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
