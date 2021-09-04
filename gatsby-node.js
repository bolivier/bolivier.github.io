const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const blogRegexp = "/(blog)/.*\\\\.mdx?$/"
const recipesRegexp = "/(recipes)/.*\\\\.md$/"
const adventRegexp = "/(advent-2020)/.*\\\\.md$/"
const bookRegexp = "/(books)/.*\\\\.md$/"

function addContextToPage(page, index, pages) {
  const previous = index === pages.length - 1 ? null : pages[index + 1].node
  const next = index === 0 ? null : pages[index - 1].node
  const {
    node: {
      fields: { slug },
    },
  } = page

  return {
    ...page,
    context: {
      slug,
      previous,
      next,
    },
  }
}

function createContentTypePages(createPage, pages, component) {
  pages.forEach(page => {
    const {
      context,
      node: {
        fields: { slug },
      },
    } = page

    return createPage({
      path: slug,
      component,
      context: {
        slug,
        ...context,
      },
    })
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const recipePost = path.resolve(`./src/templates/recipe-post.js`)
  const bookNotesTemplate = path.resolve("./src/templates/book-notes.js")
  const adventTemplate = path.resolve("./src/templates/advent-template.js")

  // this is getting tedious, fix it some time
  const blogResult = await graphql(createPageQueryString(blogRegexp))
  const recipeResult = await graphql(createPageQueryString(recipesRegexp))
  const adventResult = await graphql(createPageQueryString(adventRegexp))
  const bookResult = await graphql(createPageQueryString(bookRegexp))

  const results = [blogResult, recipeResult, adventResult, bookResult]
  results.forEach(res => {
    if (res.errors) {
      throw res.errors
    }
  })

  // Create blog posts pages.
  const posts = blogResult.data.allMdx.edges
  createContentTypePages(createPage, posts.map(addContextToPage), blogPost)

  const recipes = recipeResult.data.allMdx.edges
  createContentTypePages(createPage, recipes.map(addContextToPage), recipePost)

  const adventPosts = adventResult.data.allMdx.edges
  createContentTypePages(
    createPage,
    adventPosts.map(addContextToPage),
    adventTemplate
  )

  const books = bookResult.data.allMdx.edges
  createContentTypePages(createPage, books, bookNotesTemplate)
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
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
        allMdx(
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
