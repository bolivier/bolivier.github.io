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

function FoodListItem({ item }) {
  return <li className="food-list-item">{foodListItem.name}</li>
}

function FoodList({ foodListItems }) {
  return (
    <div className="food-list">
      {this.props.foodListItems.map(item => (
        <FoodListItem item={item} />
      ))}
    </div>
  )
}
