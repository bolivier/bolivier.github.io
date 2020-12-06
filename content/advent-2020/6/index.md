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

## Transducers

I did some refactoring. In addition to using a common util for reading files, I
also rewrote day 6 using transducers, because it felt like a natural fit for
splitting files, and after that I got interested in how they'd look and perform
differently.

First off, performance. It's noticeable at 100 iterations, but it's still
insubstantial for datasets of this size. No matter what I'm not changing the big
O of the algorithms, just changing how many iterations over a list I perform.

First off, the common utils I created:

```clojure
(defn input-reader [filename]
  (io/reader (str "resources/" filename)))
```

This is a small change, but with this I can start using `line-seq` to get the
lines. That pattern is the motivator for using transducers. If I use transducers
instead of threading macros, I can DRY up the code that parses inputs.

For instance, splitting on every line is easy, I can call `line-seq` on the
buffered reader, and I'll get what I need. But for double split lines, I'd be
repeating logic like

```clojure
(map
 #(str/split % #"\n")
 (str/split input "\n\n"))
```

I can define a transducer that will accomplish this same thing, then as long as
I'm using transducers to solve the problem otherwise, it should be easy to
compose.

```clojure
(def blank-line-splitting
  (comp (partition-by empty?)
        (remove #(and (= 1 (count %))
                      (empty? (first %))))))
```

This transducer will partition a sequence by empty elements, giving me a list
like `[["abc"] [""] ["bcd"]]` because the blank line, then will remove vectors
of size 1, where the first element is also empty. I used empty here because in
my refactored solution, it made sense to convert all the lines into sets before
partitioning, to avoid nested data transforms. Luckily, Clojure's primitive
functions operate on everything.

With that I can rewrite the solution from earlier.

```clojure
(defn solve-2 []
  (with-open [lines (utils/input-reader filename)]
    (transduce
     (comp (map set)
           utils/blank-line-splitting
           (map #(apply set/intersection %))
           (map count))
     +
     (line-seq lines))))
```

This seems confusing, but only at first. I open a reader for the filename (now
defined only in one place). I feed that data into `transduce` with `line-seq`. I
apply the changes. Convert each line into a set, partition and remove blank
lines, apply set intersections and count the resulting set. Then, I am reducing
those values with `+`.

I think this reads less cleanly than the original code, especially to people
unfamiliar with transducers (read: everyone but Rich Hickey) but the reusability
of `blank-line-splitting` is a big win. I think too the input reader/line-seq is
good. I could easily replace that with `slurp` and `str/split-lines` though.

Overall, I think it's a win. Let's see how it pans out tomorrow.
