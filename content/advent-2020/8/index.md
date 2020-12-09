---
date: 2020-12-08
---

# Part 1

For today's challenge I'm helping a kid figure out his game system boot issues.

There's a version of assembly as input, and I need to determine the value of an
accumulator the first time an instruction is run a second time.

This reminds me a lot of the Intcode computer problems from last year.

I want to get more familiar with Clojure's lazy sequences, so I'd like to use
those to solve this. You can create lazy sequences from functions. If I get a
sequence of all positions of the pc, I can take while there are no duplicates,
then I can just reduce that to the final accumulator value one step at a time.

## Lazy Seqs

Lazy seqs are created by functions that return a call to `lazy-seq`. I mimicked
the structure from some online examples. I have a 1-arity which constructs the
base case (0) and then says how to get the next element, which is to call the
2-arity version of the same function.

To start with, I'm parsing instructions like this:

```clojure
(defn get-instructions []
  (let [lines (str/split-lines (slurp (utils/input-reader filename)))]
   (map
    #(let [[instruction arg] (str/split % #" ")]
      {:instruction instruction
       :arg (Integer/parseInt arg)})
    lines)))
```

Then I can create the seq of instruction indices by calculating the new PC from
the current PC and returning a `cons` with the next pc val on the front, and
send that same value to the next function iteration

```clojure
(defn instruction-seq
  ([instructions] (lazy-seq (cons 0 (instruction-seq instructions 0))))
  ([instructions pc]
   (let [new-pc (case (:instruction (nth instructions pc))
                  "nop" (inc pc)
                  "acc" (inc pc)
                  "jmp" (+ pc (:arg (nth instructions pc))))]
     (lazy-seq (cons new-pc (instruction-seq instructions new-pc))))))
```

I can then create a function to get a seq of all values that are only called
once.

```clojure
(defn singly-executed-seq [coll]
  (let [executed (atom #{})]
    (take-while
     #(let [val (not (contains? @executed %))]
        (do (swap! executed conj %)
            val))
     (instruction-seq (get-instructions)))))
```

With my singly executed instructions seq, I can transduce to map into the
instructions, filter the non-accumulator adjusting ones, and map to the arg
value. Those values just need to be summed.

```clojure
(defn solve []
  (let [instructions (get-instructions)
        single-run-instructions (singly-executed-seq (instruction-seq instructions))]
    (transduce
     (comp (map #(nth instructions %))
           (filter #(= (:instruction %) "acc"))
           (map :arg))
     +
     0
     single-run-instructions)))
```

## Part 2

Part 2 is to repair the boot code. One jump or noop instruction can be swapped
for the other and the code should work.

Either a `nop` will become a `jmp` or a `jmp` will become a `nop`. I'm going to
reuse some of my lazy sequence stuff. If I iterate once over the list,
generating new values for each index, where it's swapped per the rules, then
I'll have all the valid permutations. I can skip any seq that isn't going to
change (neither `jmp` nor `nop`). Then with those, I can calculate the execution
seqs from before, and if I modify the fn that generates those, I can return
`nil` when the seq is exhausted. Then I can check which of those seqs generated
ends with `nil`. That's the one that reached the end of the instructions. Then
it's a simple matter to run it through the same computation as in part 1.

First, I need a couple utility fns. One to create `n` copies of a collection,
and one that works like `update` but in vectors.

```clojure
(defn copy [coll n]
  (mapv
   (constantly coll)
   (range n)))

(defn updatev [v idx f]
  (let [up-to-idx (conj
                   (subvec v 0 idx)
                   (f (nth v idx)))]
    (try
      (apply conj up-to-idx (subvec v (inc idx)))
      (catch IndexOutOfBoundsException _
        up-to-idx))))
```

Then, `instruction-seq` needs to respect the ends of the boot program.

```clojure
(defn instruction-seq
  ([instructions] (lazy-seq (cons 0 (instruction-seq
                                     instructions 0))))
  ([instructions pc]
   (let [new-pc  (if (or (nil? pc) ;; handle `nil` or pc overflow
                         (<= (count instructions) pc))
                   nil
                   (case (:instruction (nth instructions pc))
                     "nop" (inc pc)
                     "acc" (inc pc)
                     "jmp" (+ pc (:arg (nth instructions pc)))))]
     (lazy-seq (cons new-pc (instruction-seq instructions new-pc))))))
```

Now, I can just write the solution

```clojure
(defn solve-2 []
  (let [instructions (get-instructions)
        iterations (instruction-iterations instructions)
        interesting-iterations (remove
                                #(= instructions %)
                                iterations)

        ending-seq (first (filter
                           #(nil? (last (singly-executed-seq %)))
                           interesting-iterations))]
    (->> ending-seq
         singly-executed-seq
         (drop-last 2) ;; final nil value
         (map #(nth ending-seq %))
         (filter #(= "acc" (:instruction %)))
         (map :arg)
         (reduce +))))
```

I don't love this cause there are inefficiencies, like computing
`singly-executed-seq` twice, and `drop-last 2` feels magical to me. That said, I
have business to get on to before I fall behind!
