## Part 1

I'm breaking encryption on an old port on this plane. It could be considered a
terrorist action, but maybe not cause it's Christmas.

The encoding works like this, every number is the sum of 2 of the preceeding 25
numbers (preamble-length).

My puzzle is to figure out which of the numbers on the spit out by the
connection port (my puzzle input) doesn't have that quality.

I think I can use `partition` again here. If I partition into equal segments of
length `26` with a step of `1`, I can check if the last number is a sum of the
first 25 by taking 25 into a set and doing 2-sum again.

First off, I'm going to create a generic 2-sum solution. It's a little awkward
to cover the `([2] 4)` case, but whatever.

```clojure
(defn two-sum [coll n]
  (let [inverses (frequencies (map #(- n %) coll))]
    (some
     #(and (contains? inverses %)
           (if (= (/ n 2)
                  %)
             (<= 2 (inverses %))
             true))
     coll)))
```

From there I need to get the lines, split them into the 1 + the size of the
"preamble" (25 for the real prob, 5 for the sample), the drop all the values
that are valid two-sum solutions.

```clojure
(defn solve []
  (let [lines (line-seq (utils/input-reader filename))]
    (->> lines
         (map utils/parse-int)
         (partition (inc preamble-size) 1)
         (map (fn [line]
                [(drop-last line) (last line)]))
         (drop-while #(two-sum (first %) (second %)))
         first
         last)))
```

## Part 2

For part 2, I need to find a range of numbers in my input that sum to my
non-two-sum value, and submit the sum of the min/max in that range.

Starting with the first value, I need to take digits while they total to less
than my bad value (which I stored in a `def`), and after that, do a check if the
seq I grabbed sums to exactly the invalid-value. If so, I sum the min/max, if
not I either recurse or return `nil`.

This tripped me up for a while, because `take-while` returns a lazy-seq and I
was depending on the value of a side effect that came from computing the lazy
seq. I changed the code 2 different ways that worked, all 3 versions I'll put
here.

First, the version that never works.

```clojure
(defn solve-2-broken []
  (loop [remaining-lines (map utils/parse-int (line-seq (utils/input-reader filename)))]
    (let [sum (atom 0)
          total-seq (take-while #(let [new-total (+ % @sum)]
                                   (when (<= new-total invalid-number)
                                     (reset! sum new-total)
                                     true))
                                remaining-lines)]
      (cond
        (= invalid-number @sum) (+ (apply min total-seq)
                                   (apply max total-seq))
        (empty? remaining-lines) nil
        :else (recur (rest remaining-lines))))))
```

This won't work because `take-while` is never realized in the successful case. I
check `@sum`, which hasn't been updated, because side effects of a lazy sequence
require the sequence to be realized.

A trivial way to fix that is to wrap `take-while` in a `doall`, which realizes
the sequence.

> not pictured

The way that I liked much more, though, was to isolate the usage of the side
effect to the `take-while` sexp. I can compute the total of the seq with
`(reduce + coll)` just as easily.

```clojure
(defn solve-3 []
  (loop [remaining-lines (map utils/parse-int (line-seq (utils/input-reader filename)))]
    (let [sum (atom 0)
          total-seq (take-while #(do
                                   (swap! sum (partial + %))
                                   (<= @sum invalid-number))
                                remaining-lines)]
      (cond
        (= invalid-number (reduce + total-seq)) (+ (apply min total-seq)
                                                (apply max total-seq))
        (empty? remaining-lines) nil
        :else (recur (rest remaining-lines))))))
```

## Thoughts

Clojure is a language that I feel has a huge depth of complexity and nuances
that I'm only just beginning to scratch the surface of. I felt like I got most
of the base/core language before even starting this, but lazy sequences alone
have felt like a substantial growth of knowledge for me at this point.
