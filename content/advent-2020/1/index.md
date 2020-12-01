---
title: "Day 1"
date: 2020-12-01
tags: ["advent-of-code"]
done: false
---

## Part I

The schtick is still funny.  I'm taking a vacation for Christmas but before I
can leave, I have to sort out some expense report stuff.  In my report, there
are 2 entries that sum to `2020` and I need to find the product of them.

This is easy enough for me, it's identical to an interview problem I used to
give a few times a week.  You can calculate the difference of each element from
2020, and see if any of the original list numbers are present.  It's easy with
`clojure.set`.

```clojure
(defn multiply-2020-expenses [expenses]
  (apply *
         (set/intersection
          (into #{} expenses)
          (into #{} (map #(- 2020 %) expenses)))))
```

## Part II

Part 2 is harder.  There are three numbers.  I would like to figure out how to
reuse the set logic to do this, but since fixing one of three values doesn't
limit the search space enough.

One thing I could try is to generate combinations for `n choose 3` and filter
out those that don't sum to 2020.  That seems unnecessarily challenging and
doesn't build on existing code. I'll circle back if nothing comes up.

I can refactor the multiply expenses function to be slightly more general.  It
can take the total (instead of assuming `2020`), and iterate over the existing
list looking for a solution to the sub-problem.

A little finesse and that function can be refactored to use Clojure's variadic
functions to support a default arg.  I also changed the name to not include a
magic number.

```clojure
(defn multiply-expenses
  ([expenses] (multiply-expenses expenses 2020))
  ([expenses sum]
   (apply *
          (set/intersection
           (into #{} expenses)
           (into #{} (map #(- sum %) expenses))))))
```

This function gave some weird output.  I was using the repl to verify my work,
and it seemed like to eye for correctness it would be useful to see the set of 3
numbers totalling to 2020, rather than the sum of 2 of them.

It was easy enought to pull the set intersection out into a new function I called `sum-set`

```clojure
(defn sum-set [expenses sum]
  (set/intersection
           (into #{} expenses)
           (into #{} (map #(- sum %) expenses))))
```

It almost feels like cheating to put the solution code up without showing the
~20 steps I took to create it, each time verifying visually with the repl.  But this is what I got for solving problem 2.

```clojure
(defn multiply-2020-expenses-2 [expenses]
  (apply * (first (remove
           #(= 1 (count %))
           (mapv
            #(conj (sum-set expenses %)
                   (* -1
                      (- % 2020)))
            (mapv #(- 2020 %) expenses))))))
```

It's not pretty, and I'd like to clean it up a bit before pushing it to Github.
Generally when I have this much nesting to operate on one data structure, I
assume that it can threaded to look nice one way or another.  The repeated calls
to `map` and `remove` hint that it should be with `->>`.  With the cider
devtools, I can quickly refactor that to be threaded and it already looks nicer.

```clojure
(defn multiply-2020-expenses-2 [expenses]
  (->> expenses
       (mapv #(- 2020 %))
       (mapv #(conj (sum-set expenses %) (* -1
                                            (- % 2020))))
       (remove #(= 1 (count %)))
       first
       (apply *)))
```

The only eyesore, in my view, is the math.  Math never looks right in lisp.  I'd
isolate it somewhere independently and name the function.

```clojure
(defn triple-sum-set [expenses sum]
  (let [inverse-of-sum (* -1
                          (- sum 2020))]
    (conj (sum-set expenses sum) inverse-of-sum)))


(defn multiply-2020-expenses-2 [expenses]
  (->> expenses
       (mapv #(- 2020 %))
       (mapv #(triple-sum-set expenses %))
       (remove #(= 1 (count %)))
       first
       (apply *)))
```
