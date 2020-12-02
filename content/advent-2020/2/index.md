---
date: 2020-12-02
---

## Part 1

We're validating passwords from a corrupted database of Toboggan rentals. Here's
a sample of the list. The range at the start is the count requirement for the
character before the `:` and the piece after the `:` is the password.

```
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc
```

I like to split parsing a single line with iterating over all the lines.  I
should probably move the latter into a utils file.

```clojure
(defn parse-input-line [line]
  (let [[rule password] (map str/trim (str/split line #":"))
        [counts character] (str/split rule #" ")
        c (-> character char-array first)
        limits (mapv #(Integer/parseInt %) (str/split counts #"-"))]
    [limits c password]))

(defn parse-input [input]
  (map
   parse-input-line
   (str/split input #"\n")))
```

I originally had a spec to validate inputs, but it didn't work with the second
half, so I deleted it.

After that, I needed a function to validate a single line. My thought is to get
the frequencies of the string, and then it's trivial to grab the relevant char
and compare the frequency to our limits.

```clojure
(defn validate-input-line [[limits c password]]
  (let [[lower upper] limits
        char-count (get (frequencies password) c 0)]
    (<= lower char-count upper)))
```

Now I can count the number of elements in the list of all input lines that are valid.

```clojure
(defn solve []
  (let [input (slurp "resources/day-2.input")
        values (parse-input input)]
    (count (filter validate-input-line values))))

;; or with a threading macro

(defn solve []
  (->> "resources/day-2.input"
       slurp
       parse-input
       (filter validate-input-line)
       count))
```

<small>I'm not sure which of these two I like more</small>

## Part 2

For part 2, the elf realized that he gave me the wrong validation logic.  1-3
does not refer to a range, but particular indices where one xor the other must
equal the char.

Clojure doesn't have `xor` in core, so I just built one real quick.

```clojure
(defn xor [a b]
  (and (or a b)
       (not (and a b))))
```

From there, I wrote a new validation function that grabs the chars at the 2
limits (no longer an accurate name, but still good for consistency), and xors
checking their values.

```clojure
(defn validate-input-line-2 [[limits c password]]
  (let [[char-1 char-2] (mapv #(get password (dec %)) limits)]
    (xor (= c char-1)
         (= c char-2))))
```

<small>`dec` is included because these passwords are 1-indexed.</small>

With the new validation function, I copy-pasted the solve function from earlier,
and pasted the new validation in.  It worked.
