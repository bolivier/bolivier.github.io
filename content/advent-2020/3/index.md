---
date: 2020-12-03
---

## Part 1

I'm navigating my previously rented toboggan down a hill toward the airport, and
I have to plot some routes to figure out how many trees I need to avoid.

My input is like

```
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
```

 Where `#` represents a tree, `.` represents an open airy (very small) field and
 the input repeats indefinitely to the right.  My path is going to be 3 right
 and 1 down, to determine which points I cross.

 To count the trees, I need to project a line with slope 3/1 across all the line
 (y) values.  Since I'm using them all, I can map across them, and if I track
 the index, I can multiply that value by 3 and `mod` it by the width to get my x
 position.

 ```clojure
 (defn plot-route [toboggan-map]
  (let [width (count (first toboggan-map))]
    (map-indexed
     (fn [i n]
       (get-in toboggan-map [n (mod (* 3 i) width)]))
     (range (count toboggan-map)))))

(defn solve []
  (let [input (slurp "resources/day-3.input")
        toboggan-map (str/split input #"\n")]
    (-> toboggan-map
        plot-route
        frequencies
        (get \#))))
```

## Part 2

For part 2, I need to vary the slopes.  It's pretty easy to modify `plot-route`
to take a dx, but modifying a dy value is going to be hard (and definitely
unidiomatic) because I'm using map.  I can convert that to use loop/recur and
that'll be more amenable to variable dx values.

```clojure
(defn plot-route [toboggan-map]
  (let [width (count (first toboggan-map))]
    (loop [x 0
           y 0
           route []]
      (if (= (count toboggan-map) y)
        route
        (recur (+ 3 x)
               (+ 1 y)
               (conj route (get-in toboggan-map [y (mod x width)])))))))
```

With this in place, it's trivial to update `3` and `1` to be variable values
`dy` and `dx` so we can check any given slope.  I can also create a variadic
version of this fn that will work with just 1 arg, so we don't have to update
the solution to part 1.

Now I can iterate over the various slope values from the problem, and apply `*`
to the resulting seq of counts.

```clojure
(defn solve-2 []
  (let [input (slurp "resources/day-3.input")
        toboggan-map (str/split input #"\n")
        map-plotter (partial plot-route toboggan-map)
        slope-vals [[1 1] [1 3] [1 5] [1 7] [2 1]]]
    (apply *
           (for [slope-val slope-vals]
             (get (frequencies (apply map-plotter slope-val)) \#)))))
```
