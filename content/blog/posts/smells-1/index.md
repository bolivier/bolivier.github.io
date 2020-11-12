---
title: "Code Smells: Secondary Render Methods"
description: Something
date: 2020-01-23
tags: ["javascript", "refactoring"]
---

> Code Smell (n): a surface indication that usually corresponds to a deeper
> problem in the system.

I see a lot of React code that uses this pattern

```javascript
class FoodList extends React.Component {
  renderFoodListItem = foodListItem => {
    return <li className="food-list-item">{foodListItem.name}</li>
  }
  render() {
    return (
      <div className="food-list">
        {this.props.foodListItems.map(item => {
          return this.renderFoodListItem(item)
        })}
      </div>
    )
  }
}
```

This smells to me.

What **is** a React component? It's a function that returns JSX.
`this.renderFoodListItem` _is_ a component. It represents a single item in a
food list, but it doesn't have a proper name and isn't afforded the respect it
deserves. We have to hope that we always want to render food items in exactly
the way that `FoodList` expects.

When I come across this kind of method, I like to refactor it to pull out that
hidden component that should be living it its own file. That way, if I need to
configure it, I know right where to look, I have a place just for that
configuration, `FoodListItem.js`.

```javascript
// FoodListItem.js
function FoodListItem({ item }) {
  return <li className="food-list-item">{foodListItem.name}</li>
}

// FoodList.js
function FoodList({ foodListItems }) {
  return (
    <div className="food-list">
      {this.props.foodListItems.map(item => (
        <FoodListItem item={item} />
      ))}
    </div>
  )
}
```

It's a pretty minor change in this instance, in terms of code, but by creating a
more composable api, we separate concerns about how to iterate over data, and
how to display that data, making those things easier to grok and change in the
future.
