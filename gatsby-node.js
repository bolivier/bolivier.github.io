const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const blogRegexp = "/(blog)/.*\\\\.md$/"
const recipesRegexp = "/(recipes)/.*\\\\.md$/"

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

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })

  recipes.forEach((recipe, index) => {
    const previous =
      index === recipes.length - 1 ? null : recipes[index + 1].node
    const next = index === 0 ? null : recipes[index - 1].node

    createPage({
      path: recipe.node.fields.slug,
      component: recipePost,
      context: {
        slug: recipe.node.fields.slug,
        previous,
        next,
      },
    })
  })
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
