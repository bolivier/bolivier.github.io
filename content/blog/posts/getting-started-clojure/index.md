---
title: Getting Started with Clojure(script)
description: "todo: learn lisp"
date: 2020-02-10
---

I love writing Clojure, but it took me a long time to get into it, mostly
because of the configuration options.  I got a handle of what I liked and how to
assemble some pieces of Clojure into a productive dev environment.

I want to show off how using cljs can help you be more productive and how you
can use simpler tools to write web apps. We're giong to write the classic
todomvc app.  I'm going to start with the client, using shadow-cljs to build our
Clojurescript.

To follow along, you'll just need to install [Leiningen][1], a popular Clojure
build tool.

[1]: https://leiningen.org/

### A word on editor integration

Clojure is meant to be evaluated in a REPL (Read Eval Print Loop), but you're
not meant to type everything in at the prompt to get it working.  You should set
up your editor of choice to support `eval-last-sexp` in order to get the most
out of this tutorial

### Installing the template

Leiningen suports templates, they're like customizable versions of
`create-react-app`.  I created my own for personal use, and that's what I'm
going to assume you're starting with.  Create the project template with

```
lein new bolivier-web todomvc
```

To get a live frontend environment, you'll need to open a terminal and run

```
shadow-cljs watch frontend
```

You may also need to run

```
shadow-cljs npm-deps
```

That should configure everything you need.  That said, I highly recommend you
look through the `user.clj` file to figure out how to get the repl working in
your editor of choice.  If that doesn't work out, there are ways to connect to a
remote repl that I won't detail here.

### Writing our todo app

Now that we have a repl available, it should be easy to work on the logic of our
application before we write a single line of UI.  Let's do that.

First off, we'll need a reactive atom to store our state, and we'll want a
factory that can create more.  My immediate thought is to use a list, but since
we'll want random access toggling them, better to index by an id and sort them
for display.

```clojure
;; core.cljs
(defonce todos (r/atom {}))

(defn get-next-id []
  (if (empty? @todos)
    0
    (->> @todos
         vals
         (map :id)
         (apply max)
         inc)))

(defn todo-factory [label]
  (let [id (get-next-id)]
    {:label label
     :id id
     :completed? false}))
```

> <small>`->` and `->>` operator are threading macros.  They're different ways of
> "unwinding" nested function calls.  Read the official [guide][7].</small>

[7]: https://clojure.org/guides/threading_macros

Atoms are special stateful pieces of data.  The value inside the atom is
immutable, but what it points to isn't.  Clojure is functional, but it's still
pragmatic.  You can mutate, just _know_ that you're doing it.  You can update
values in atoms with `swap!` which takes the atom, and a function to update the
atom, and `reset!` which just takes the atom and a value to reset it to.

I defined `todos` with `defonce` so that when our app rerenders, it won't
reevaluate the code and reset the value.  This preserves state across hot
reloads.

Now we can trivially generate new todos (try it out in your repl), but we can't
add them to our state.  Let's write a function to assoc new values into our
state.

```clojure
(defn add-todo [todo]
  (swap! todos (fn [todo-state]
                 (assoc todo-state (:id todo) todo))))
```

Here you can see how `swap!` works. The _value_ of the atom is passed to the
function and the value returned is what it'll be set to.

We still need to be able to change our todos.  The spec calls for editing
labels, and un/checking. Let's do that.

```clojure
(defn update-label [todo-id new-label]
  (swap! todos #(assoc-in % [todo-id :label] new-label)))

(defn toggle-completed [todo-id]
  (let [completed (get-in @todos [todo-id :completed?])]
  (swap! todos #(assoc-in % [todo-id :completed?] (not completed)))))
```

With all that, we should be able to do all the necessary operations on our data,
so let's build a UI.  Since we're building a todo app, let's grab the [TodoMVC][6]
styles to keep things looking professional.

Put those styles in `/public/css/index.css` and add this line to the head of
your `index.html`

```html
<link rel="stylesheet" href="/public/css/index.css">
```

They have the html structure on their site [here][7].  I recommend that you try
and convert it into a hiccup format yourself, but if you don't want to, I prepared a
[gist][8] with the relevant hiccup code.  I'll be working from mine as a
reference, but you should be able to adapt whatever you have.

> <small> Note: you'll need to have your charset set to utf-8 for that to render
> properly</small>

```html
<meta charset="utf-8">
```

First thing, I'm going to rip out the lines for the list of todos, starting at `:ul.todo-list`.

We're going to make our first component, `todo-list`.  Components are just
functions that return hiccup.

```clojure
(defn todo-list []
  [:ul.todo-list
   (map
    (fn [{:keys [completed? label id]}]
      ^{:key id }[:li
                  {:class (when completed? "completed")}
                  [:div.view
                   [:input.toggle {:type "checkbox"
                                   :checked completed?}]
                   [:label label]
                   [:button.destroy]]])
      (vals @todos))])
```

> <small>`{:key id }` is the Reagent version of `key={}` in React. The diffing engine
> sometimes needs help identifying different nodes, and so those help.  Cljs
> uses metadata attached to the vector. </small>

Now, what's cool about what we've just written is that if you update your state
in the REPL, the state in the browser will automatically update to match it.
You don't need to build complex UI interactions to build a nice UI.  Everything
is driven by the data, and the REPL gives us a first class construct to
manipulate our application data live.

Here we should just be able to add a click handler to the input, and then it
should toggle.  The UI should react to changes in our state, and we already
wrote the functions to handle state changes.

Change the input to look like:

```clojure
[:input.toggle {:type "checkbox"
                :on-change #(toggle-completed id)
                :checked completed?}]
```

and that should be it; it should toggle now.

Let's try our hand at adding a todo item.

It's the same process, first let's pull out a component that we can look at more
in isolation.  I pulled out a component called `todo-adder`.

```clojure
(defn todo-adder []
  [:input.new-todo
   {:autoFocus true
    :placeholder "What needs to be done?"}])
```

Here, things are trickier.  We have a piece of internal state that we'll need to
hold on to and reset after a user presses Enter.

Reagent lets you return a renderer function so that you can do one-time
component setup.  We'll return a function that renders this, and before that,
create reactive atom with a value for the input.  Then we'll monitor kepress
events and on-change events to respond to pressing `"Enter"` as well as updating
that state.

What we're going to do now is set a reactive atom, return a function, wire up a
callback to submit and clear the value on enter.

```clojure
(defn todo-adder []
  (let [value (r/atom "")
        on-key-press #(when (= "Enter" (.-key %))
                        (do
                          (add-todo (todo-factory @value))
                          (reset! value "")))
        on-change #(reset! value (-> % .-target .-value))]
   (fn []
     [:input.new-todo
      {:autoFocus true
       :value @value
       :on-change on-change
       :on-key-down on-key-press
       :placeholder "What needs to be done?"}])))
```

<small>Note: the renderer function needs to have _identical_ arguments to the
containing one.</small>

Now we can add and complete todos, let's handle the filtering.  For that, we
need to set up a new piece of state and update it when you click on different
filter buttons, and it needs to run some processing (filtering) on the list of
todos.

To start with, let's create our state and state-changing functions.  I want a
single keyword called `todo-filter` that will be a reactive atom storing a
todo-filter identifier, an item in `#{:all :completed :active}`.  Keywords are
meant for identifiers like this.

```clojure
(defonce todo-filter (r/atom :all))

(defn change-todo-filter [new-filter]
  (reset! todo-filter new-filter))
```

Now we can manipulate our new state all we want, but it's not tied to the actual
view.  First let's move that list filter to a `filter-list` component.

```clojure
(defn filter-list []
  [:ul.filters
      [:li
       [:a.selected "All"]]
      [:li
       [:a "Active"]]
      [:li
      [:a "Completed"]]])
```

Looking at this, we're going to have the same thing repeated 3 times with minor
differences.  That smells like a new component to me.  I'm going to create a
`filter-list-indicator` and pass in a symbol identifier, the same ones that'll
be sent to `todo-filter` to each one.  Symbols can be easily converted to
capitalized strings with `clojure.string/capitalize` and `name`.

```clojure
(ns todomvc.core
  (:require [clojure.string :as str]
            [reagent.core :as r]))

;; ...

(defn filter-list-indicator [id]
  (let [label (str/capitalize (name id))]
    [:li
     [:a
      {:class (when (= id @todo-filter)
                "selected")}
      label]]))

(defn filter-list []
  [:ul.filters
   [filter-list-indicator :all]
   [filter-list-indicator :active]
   [filter-list-indicator :completed]])
```

Just like before you should be able to manipulate the value of `todo-filter` in
the REPL and see it change on the screen.

From there, all we need to do to complete this is to add an `on-click` handler to the anchor.

```clojure
{:class (when (= id @todo-filter)
          "selected")
 :on-click #(change-todo-filter id)}
```

That's cool, but it doesn't do any filtering just yet.  To implement that, we'll
need to configure a filtering function based on `todo-filter`.

There are a lot of ways to write this, but I'm going to use a switch statement
and not do anything fancy.

```clojure
(defn filtered-todos []
  (let [todo-list (vals @todos)]
   (case @todo-filter
     :all todo-list
     :active (filter
              #(not (:completed? %))
              todo-list)
     :completed (filter :completed? todo-list))))
```

Now instead of writing `(vals @todos)` in `todo-list`, we write
`(filtered-todos)` and we're done.

One last piece of functionality, `clear-completed-todos` to implement.  To do
that, we just need to `swap!` `todos` with a filtered version.  Let's do that.

```clojure
(defn clear-completed []
  (swap! todos (fn [todo-state]
                 (remove (fn [[_ v]] (:completed? v)) todo-state))))
```

I'm using a bit of destructuring syntax, don't be nervous.  It works just like
JS destructuring.  After verifying that function works in the repl, I'm ready to
add a click handler.

```clojure
[:button.clear-completed
      {:on-click clear-completed}
      "Clear completed"]
```

And that's it.  That's the whole frontend of todomvc.

### Conclusion

There are a few things about Clojurescript that provide a superior
dev-experience to Javascript, in my mind.  First off, the hot reloading in
Clojurescript is lightyears ahead of the normal React world.

I also find that the process of building the UI with data that I don't
manipulate through the UI to be a game changer.  I can usually predict the state
before I can impelment or decide how I want to display those manipulations.
Being able to invert that dev flow is something I find very productive.

Lastly, the drop in incidental complexity from using immutable data structures
that _always_ compare via value is a huge relief.  The number of times I find
myself reaching for `_.deepEqual` in JS is absurd.

I hope you found this interesting and/or useful.  Let me know.

[6]: https://raw.githubusercontent.com/tastejs/todomvc-app-css/master/index.css
[7]: https://github.com/tastejs/todomvc-app-template/blob/master/index.html
[8]: https://gist.github.com/bolivier/7bdcd952ec72c20f18dd459437d9127c
