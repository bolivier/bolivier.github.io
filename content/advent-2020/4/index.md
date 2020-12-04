---
date: 2020-12-04
---

## Part 1

Today we're committing passport fraud. I'm at the airport, no time to go back
home, and I've forgotten my passport and grabbed my North Pole Credentials by
mistake! Luckily they're similar enough that I can trick a security guard.

The puzzle input is verifying a collection of passport data.

The input looks like this:

```
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
```

<small>where:</small>

- `byr` (Birth Year)
- `iyr` (Issue Year)
- `eyr` (Expiration Year)
- `hgt` (Height)
- `hcl` (Hair Color)
- `ecl` (Eye Color)
- `pid` (Passport ID)
- `cid` (Country ID)

At first I thought validation would be a good use case for `clojure.spec`, but
after reading that validation was essentially just checking keys, set logic
should cover the use case just fine. It would also be fun to use
[instaparse](https://github.com/Engelberg/instaparse), but that's overkill for
what is going to be straightforward ad-hoc parsing.

All I need to do is split on `\n\n` then parse each individual entry by
splitting into entries with `#"\s"` and splitting those into keys and values and
merging each line into a single map.

```clojure
(defn parse-single-input [single]
  (let [elements  (str/split single #"\s")
        parse-single (fn [elm]
                       (let [[k v] (str/split elm  #":")]
                         [(keyword k) v]))]
        (into {} (map parse-single elements))))

(defn parse-input [input]
  (map parse-single-input
       (str/split input #"\n\n")))
```

And now I need to get the full input set and filter based on which ones have the
required overlap with some `required-fields` (which, in this case is just
`cid`).

```clojure
(defn solve []
  (let [raw-input (slurp "resources/day-4.input")
        input (parse-input raw-input)]
    (->> input
         (map #(into #{} (keys %)))
         (map (partial set/intersection required-fields))
         (filter #(= required-fields %))
         count)))
```

## Part 2

Part 2 is the real validation logic, we have to coerce some stuff into integers,
and other string fields have particular requirements.

For my own satisfaction, I decided to use `cloure.spec` to handle this (which is
probably inappropriate for a production system).

Our real data requirements are:

- `byr` (Birth Year) - four digits; at least `1920` and at most `2002`.
- `iyr` (Issue Year) - four digits; at least `2010` and at most `2020`.
- `eyr` (Expiration Year) - four digits; at least `2020` and at most `2030`.
- `hgt` (Height) - a number followed by either cm or in:
  - If `cm`, the number must be at least `150` and at most `193`.
  - If `in`, the number must be at least `59` and at most `76`.
- `hcl` (Hair Color) - a `#` followed by exactly six characters `0-9` or `a-f`.
- `ecl` (Eye Color) - exactly one of: `amb` `blu` `brn` `gry` `grn` `hzl` `oth`.
- `pid` (Passport ID) - a nine-digit number, including leading zeroes.
- `cid` (Country ID) - ignored, missing or not.

First, let's just preemptively create the passport spec.

```clojure
(s/def ::passport (s/keys :req-un [::ecl
                                   ::pid
                                   ::eyr
                                   ::hcl
                                   ::byr
                                   ::iyr
                                   ::hgt]
                          :opt-un [::cid]))
```

Let's move on to the integer fields. I'm going to parse them into real integers
to more easily validate them. In doing this I realized that `update` will use
`nil` for nonexistent fields, which invalidates my previous solution, something
I'm not okay with. So I need a small helper fn to update if present - it won't
work in the most general cases, but who cares.

```clojure
(defn update-when [coll k f]
  (if (get coll k)
    (update coll k f)
    coll))

(defn parse-int [^String s]
  (try
    (Integer/parseInt s)
    (catch java.lang.NumberFormatException _
      s)))

;; this fn largely the same
(defn parse-single-input [single]
  (let [elements  (str/split single #"\s")
        parse-single (fn [elm]
                       (let [[k v] (str/split elm  #":")]
                         [(keyword k) v]))
        raw-vals (into {} (map parse-single elements))]
    (-> raw-vals
        (update-when :byr parse-int)
        (update-when :iyr parse-int)
        (update-when :eyr parse-int))))
```

With that in place, I can create specs relatively easily:

```clojure
(s/def ::byr (s/and int?
                    #(<= 1920 % 2002)))
(s/def ::iyr (s/and int?
                    #(<= 2010 % 2020)))
(s/def ::eyr (s/and int?
                    #(<= 2020 % 2030)))
```

The next simplest one should be eye color, `ecl`, which is just any of a set of
values. I can use a set to spec that.

```clojure
(s/def ::ecl #{"amb" "blu" "brn" "gry" "grn" "hzl" "oth"})
```

Onwards to hair color and the passport id (`hcl` and `pid`), which both just
need to match a regexp.

```clojure
(s/def ::pid #(boolean (re-matches #"\d{9}" %)))
(s/def ::hcl #(boolean (re-matches #"#[a-f0-9]{6}" %)))
```

And then there was one. The most complex one. Heights are strings, either ending
in `in` or `cm` and those two types have different numerical requirements. I'm
going to annotate this one.

```clojure
(s/def ::hgt
  ;; always a string
  (s/and string?
         ;; a helper fn to grab/parse the number portion,
         ;; reusing my safe `parse-int` fn from earlier.
         (let [extract-n #(->> %
                               (drop-last 2)
                               (str/join "")
                               parse-int)]
            ;; either inches or centimeters.
            ;; spec makes you name `or` branches
           (s/or :inches
                 (s/and #(str/ends-with? % "in")
                        #(<= 59 (extract-n %) 76))
                 :cm
                 (s/and #(str/ends-with? % "cm")
                        #(<= 150 (extract-n %) 193))))))
```

Whew!

With all that in place, I just need to parse all the passports and filter by
`s/valid?`

```clojure
(defn solve-2 []
  (let [raw-input (slurp "resources/day-4.input")
        input (parse-input raw-input)]
    (->> input
         (filter #(s/valid? ::passport %))
         count)))
```

## Thoughts

I really like using Spec. I've only used it for trivial kinds of things before
this, but it's nice to build something like validation out of pieces that are
more robust than ad-hoc functions built by me. It's especially nice, because I
can do a lot more with this than validation functions. I could extend those
specs relatively easily with generators and set up generative testing for my
code.

I don't like not reusing the first solution, but that's okay. I'll survive, I
think.
