---
date: 2020-12-06
---

# Part 1

I'm starting to get annoyed by how often I'm repeating the same stuff to
read/split these inputs. I'm going to spend some time after this puzzle to
create a solution that'll work to read all the inputs.

Anyway, this puzzle for now. I'm helping some of my fellow passengers fill out
their customs declarations forms. I have them answer the questions and record
their responses like this

```
abcx
abcy
abcz
```

Where those letters represent "yes" to various questions.

Additionally, the answeres for grouped. A blank line represents a new group, and
each group only needs one answer to count as a "yes" for the group.

The puzzle is to find the sum of "yes" answers over all the groups on the
flight.

The yes-per-group restriction is just a set. I can collect all the answers for a
single group, then collapse them into a set, and all the duplicates are wrong.
After that, I just need to map to the counts and apply `+`.

Additionally I split the list all the way down to the answers for different
passengers and recombined them, but I realized that I could simplify a lot of
things by just removing the newlines from the group answers initially and
treating them all as one response.

This solution is small enough for me to just put it all up at once.

```clojure
(defn input []
  (slurp (io/resource "day-6.input")))

(defn split-input [input]
  (map
   #(str/replace % #"\n" "")
   (str/split input #"\n\n")))

(defn solve []
  (->> (input)
       split-input
       (map set)
       (map count)
       (apply +)))
```

## Part 2

Part 2 switches questions where _anyone_ answered yes, to questions that
_everyone_ answered yes. I guess I should've kept my initial oversplitting
solution.

I can collect everyone's individual responses into sets and then get the set
intersections from each group.

I modified the first solution to

```clojure
(defn split-input [input]
  (map
  ;; changed
   #(str/split % #"\n")
   (str/split input #"\n\n")))

(defn solve []
  (->> input
       split-input
       ;; changed
       (map str/join)
       (map set)
       (map count)
       (apply +)))
```

It's inefficient to split and rejoin, but It's necessary for part 2 and harmless
for part 1.

The solution to part 2 looks similar to part 1, but has more internal maps. I'll
end up with a list of string lists like

```
[["abc"]
 ["a" "b"]]
```

and I need to convert each of those strings into a set of chars, apply the
set/intersection to each group, get the count of those intersection sets, then
apply `+` to get the final sum.

```clojure
(defn solve-2 []
  (->> (input)
       split-input
       (map #(map set %))
       (map #(apply set/intersection %))
       (map count)
       (apply +)))
```

## Thoughts

Reading in files has been so duplicated, I want to create a single function
that'll just give me what I want. I should be straightforward, it just needs
options to split on single/double lines.

I also think this problem really showcases, again, Clojure's ability to create
small succinct solutions that pretty closely match how I would describe the
solution in English.
