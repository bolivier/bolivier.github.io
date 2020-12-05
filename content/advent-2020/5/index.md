---
date: 2020-12-05
---

## Part 1

I forgot my boarding pass, but I'm somehow still gettinig on the plane. To
figure out where I sit, I need to parse boarding passes. They don't use a normal
"row, col" indexing pattern, they use "binary space partitioning".

Boarding passes look like `FBFBBFFRLR` where `F` means "front", `B` means
"back", `L` means "left" and `R` means "right". With that you can figure out
your seat.

It should be straightforward enough to iterate over the potential list of seats
and remove halves as necessary. To do that I created 2 helper functions
`first-half` and `second-half`.

```clojure
(defn first-half [coll]
  (let [half (int (/ (count coll)
                     2))]
    (take half coll)))

(defn second-half [coll]
  (let [half (int (/ (count coll)
                     2))]
    (drop half coll)))
```

With that, I just need to loop over the pass, taking the first or second half of
either the possible rows or the possible columns until I can return `[row col]`,
my seat.

```clojure
(defn get-seat [boarding-pass]
  (loop [possible-rows (range 128)
         possible-columns (range 8)
         bp boarding-pass]
    (case (first bp)
      \F (recur (first-half possible-rows)
                possible-columns
                (rest bp))
      \B (recur (second-half possible-rows)
                possible-columns
                (rest bp))
      \L (recur possible-rows
                (first-half possible-columns)
                (rest bp))
      \R (recur possible-rows
                (second-half possible-columns)
                (rest bp))
      nil [(first possible-rows) (first possible-columns)])))
```

I don't tend ot use `loop` that often, but this seems like a good time. Reducing
this would be a pain I think.

The actual task is to get the highest seat id, which is defined by
`id = 8 * row + col`.

```clojure
(defn get-id [[row col]]
  (+ (* 8 row)
     col))

(defn solve []
  (let [lines (->> "day-5.input"
                   io/resource
                   slurp
                   str/split-lines)]
    (apply max (map
                (comp get-id get-seat)
                lines))))
```

## Part 2

Time to find my seat! It's the only one missing from the survey of seats from
the last problem. The issue is that this aircraft is missing seats on the front
and back. My seat is also not at the very front or the very back.

That should be easy enough to overlook, I can get all the seat ids, since the
flight is full and they map to an incrementing by 1 sequence, I can create the
id sequence and check for any gaps.

To do that, I partition the list into each element and the next element.

```
[1, 2, 4, 5]
```

becomes

```
[[1, 2], [2, 4], [4, 5]]
```

I can remove all adjacent seats leaving just `[2, 4]`, where my seat is the
first incremented by 1.

In Clojure,

```clojure
(defn solve-2 []
  (let [lines (->> "day-5.input"
                   io/resource
                   slurp
                   str/split-lines)
        adjacent? (fn [[f s]]
                    (= 1 (- s f )))]
    (->> lines
         (map (comp get-id get-seat))
         sort
         (partition 2 1)
         (remove adjacent?)
         ffirst
         inc)))
```

## Thoughts

I was intimidated at first; I get uncomfortable with certain problems in Clojure
because they remind me of interview questions I tried to work on when I started
with the language and I struggled every time, and failed often.

That said, most of the solution to this problem fell out of the definitions of
`first-half` and `second-half`. `partition` also does a lot of heavy lifting.
