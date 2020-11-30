import { Link } from "gatsby"
import React from "react"
import { Card } from "./card"

export function AdventCalendar({ data }) {
  const december2020CalendarDays = [null, null, ...range(1, 26), null, null]

  const links = Object.fromEntries(
    data.map(({ node }) => [node.fields.slug.split("/")[2], node.fields.slug])
  )

  return (
    <Card title="Advent of Code 2020" style={{ marginBottom: "1rem" }}>
      <div className="grid grid-cols-7 gap-1.5">
        {december2020CalendarDays.map(day => (
          <AdventCalendarDay day={day} link={links[day]} />
        ))}
      </div>
    </Card>
  )
}

function AdventCalendarDay({ day, link }) {
  const color = day === null ? "gray" : link ? "green" : "yellow"
  if (link) {
    return (
      <Link to={link} className="shadow-none">
        <div className={`border rounded bg-${color}-200 text-center`}>
          {day}
        </div>
      </Link>
    )
  } else {
    return (
      <div className={`border rounded bg-${color}-200 text-center`}>{day}</div>
    )
  }
}

function range(start, end) {
  let result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}
