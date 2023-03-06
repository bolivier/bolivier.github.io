---
title: "Solving Problems With Clojure"
date: "2020-11-14"
tags: ["clojure"]
---

This is a little late, but I was doing the Advent of Code last year and I think
this problem really shows off how Clojure's idioms promote smaller, declarative,
simpler code.

If you haven't heard of it, Advent of Code is a Christmas themed set of
programming exercises. Some of them build on one another and some of them are
indpendent. This one was indpendent.

## The Problem

The problem statement is pretty long, so I'll just try to summarize it here.
Given a definition of a solar system, specifically of orbital bodies, you need
to compute the minimum number of orbital transfers from my location (I'm
orbiting something) to Santa's location (he is also orbiting something).

The input to the problem is a collection of orbital definitions like `COM)B`.
Here, `B` orbits `COM` (the center of mass of the solar system).

> <small>This is a visualization of the full sample input</small>

```
                          YOU
                         /
        G - H       J - K - L
       /           /
COM - B - C - D - E - F
               \
                I - SAN
```

## The Solution

I realized my path to the `COM` and Santa's path to the `COM` would intersect
along the way back to the `COM`. The minimum path follows my path to the `COM`
until I intersect Santa's path, then follows his path down to `SAN`.

The path would look like `YOU -> K -> J -> E -> D -> I -> SAN`. The number of
bodies in the list is 7, but the number of orbital transfers is 6. That means
the number of transfers is the total number of bodies that are distinct in each
of our lists (here excluding `D`, where they meet).

Translating into something more programming adjacent, I can use set logic to do
those calculations. I'm looking for the **union** between the **difference**s of
each path and the **intersections** of both paths.

```clojure
(let [intersections (intersection my-path san-path)]
    (count (union (difference my-path intersections)
                  (difference san-path intersections))))
```

With that plan in mind, I can start working. First I need to parse the orbit
input into something more useful. Given a planet, what I'm interested in is
"what do you orbit"?

I can create a map to hold that data with 2 functions. One to parse a single
line and convert it into a map, and another to iterate over every line in my
input and merge them into one `orbit-map`.

```clojure
(defn parse-orbit-line [s]
  (->> (str/split s #"\)")
       (map keyword)
       reverse
       (apply hash-map)))

(defn parse-input [input]
  (->> (str/split input #"\n")
       (map parse-orbit-line)
       (reduce merge)))
```

Clojure supports calling a map as a function. If I call `orbit-map` with `YOU`,
then it will give me what I am orbiting. If I call `orbit-map` on that output,
it will give me what it orbits. If I repeatedly call `orbit-map` on the last
output, it will give me the path from `YOU` to `COM`.

While the value returned isn't `nil`, I need to take from the next **iteration**
of calling `orbit-map`.

```clojure
(defn generate-path-to-root [planet orbit-map]
  (take-while
   (comp not nil?)
   (iterate orbit-map planet)))
```

With that, I can get my path to the `COM`, Santa's path to the `COM`, and I can
do the necessary set operations on that to get the total path.

```clojure
(defn solution-2 [input]
  (let [orbit-map (parse-input input)
        my-path (into #{} (generate-path-to-root :YOU orbit-map))
        san-path (into #{} (generate-path-to-root :SAN orbit-map))
        intersections (intersection my-path san-path)]

    (count (union (difference my-path intersections)
                  (difference san-path intersections)))))
```

---

## All the code:

```clojure
(defn parse-orbit-line [s]
  (->> (str/split s #"\)")
       (map keyword)
       reverse
       (apply hash-map)))

(defn parse-input [input]
  (->> (str/split input #"\n")
       (map parse-orbit-line)
       (reduce merge)))

(defn generate-path-to-root [planet orbit-map]
  (take-while
   (comp not nil?)
   (iterate orbit-map planet)))

(defn solution-2 [input]
  (let [orbit-map (parse-input input)
        my-path (into #{} (generate-path-to-root :YOU orbit-map))
        san-path (into #{} (generate-path-to-root :SAN orbit-map))
        intersections (intersection my-path san-path)]

    (count (union (difference my-path intersections)
                  (difference san-path intersections)))))
```

## Thoughts

While it's not the _most_ intuitive necessarily, I think it's clean, and it fits
on less than half a screen on my monitor. It also doesn't create any new
constructs. This problem fits into basic programming constructs.

When I was in math classes, there was a lot of emphasis on "word problems" and I
only recently came to a deep intuitive understanding of why. Word problems is
translating english into math. I think there's a parallel skill in computer
science for translating your domain problem into something computer scientists
have solved. If you realize that your problem domain is easily modeled as a
graph, you unlock a lot of high level ideas about your data, and algorithms you
can use on your data that you don't have to invent ad-hoc. I like that Clojure
encourages that and shies away from coercing the computer into your problem
domain. Learn to do computer word problems.
