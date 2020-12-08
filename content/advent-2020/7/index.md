## Part 1

This one looks hard.

My input is valid "bag rules" at the airpoort. They look like this

```
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
```

My question is _"You have a shiny gold bag. If you wanted to carry it in at
least one other bag, how many different bag colors would be valid for the
outermost bag."_

My immediate thought on reading the rules was that they map to a data structure
like this.

```clojure
{:light-red {:bright-white 1
              :muted-yellow 2}
 :dark-orange {:bright-white 3
               :muted-yellow 4}
 ;;...
 }
```

However, I think if I invert that map, I can use it like a fn and repeatedly
call it getting out the next valid kind of bag. I should be able to use a queue
for that.

It's not especially clean, but I can create that contained map and put that fn
inside a transducer mapping and do what is essentially a breadth first search on
the bag space.

```clojure
(defn to-contained-map [[raw-container raw-contained]]
  (let [container (keyword (str/join "-" (drop-last (str/split raw-container #" "))))]
    (map
     (fn [[n & colors]]
       {(keyword (str/join "-" (drop-last colors))) #{container}})
     (map
      (fn [s]
        (str/split s #" "))
      (map str/trim (str/split   raw-contained #","))))))

(def container-mapping (comp (map #(str/split % #"contain"))
                             (map #(map str/trim %))
                             (map to-contained-map)
                             (map #(apply merge %))))

(defn solve []
  (let [m (transduce container-mapping
                     (partial merge-with union)
                     (line-seq (utils/input-reader filename)))]
    (count (loop [bags-to-check [:shiny-gold]
                  bags-that-can-hold #{}]
             (if (empty? bags-to-check)
               bags-that-can-hold
               (let [bags (get m (first bags-to-check))]
                 (recur (apply conj (rest bags-to-check) bags)
                        (apply conj bags-that-can-hold bags))))))))
```

## Part 2

How many bags are required to be inside of my bag? a `shiny gold` bag isn't
allowed to be shipped empty, so it needs contents.

This one was a struggle for me to get right. I basically took the same approach.
Generate a map of values like I originally thought to use, and define a
`count-bags` function that'll iterate down that tree and collect up the
necessary values for how many bags exist inside my bag.

I ended up with something I don't like, but don't have the energy to break down
today.

```clojure
(defn count-bags [m bag-name]
  (if (= nil (m bag-name))
    0
    (apply +
           (conj
            (map
             :n
             (m bag-name))

            (apply +

                   (map (fn [{:keys [n name]}]
                          (* n (count-bags m name)))
                        (m bag-name)))))))

(defn part-2-map
  []
  (transduce container-mapping
             merge
             (line-seq (utils/input-reader filename))))

(defn solve-2 []
  (let [m (part-2-map)]
    (count-bags m :shiny-gold)))
```
