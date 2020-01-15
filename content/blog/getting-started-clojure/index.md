---
title: Getting Started with Clojurescript
description: It shouldn't be this hard
date: 2020-01-14
---

I love writing Clojure, but I consistently struggled (and still do) with getting
up-and-going.  I spend a lot of time finagling build tools and working on stuff
that isn't interesting or related to my idea.  Here's how you can get a Clojure
app up and running.

Let's start.

I mostly work with single page apps, so that's what I'm going to go through
here.  For the frontend, we'll use Clojurescript (with a React wrapper).  For
the backend, we'll set up Clojure with an http server, postgres drivers, and
some sql query tools.

I'm going to start with the frontend.  We need to setup our Clojurescript build
process.

Cljs has a couple dedicated build tools, [shadow-cljs][1] and [figwheel][2].  I
primarily work in JS land, and so I want to be free to use JS libs on
npm. Shadow-cljs has better integration with npm, so that's what I want to use.
Since I want to incorporate a backend server later, it also makes sense to use
[Leiningen][3], the de-facto build tool for Clojure.  Luckily, shadow-cljs can
integrate with leiningen without much difficulty.

[1]:https://github.com/thheller/shadow-cljs
[2]:https://github.com/bhauman/figwheel-main
[3]:https://github.com/technomancy/leiningen

|tool| version I'm using|
|-|-|
| `java` | Java 13.0.1 OpenJDK|
|`leiningen` | Leiningen 2.9.1|
| `shadow-cljs` | 2.8.83|
| `clojure` | 1.10.0|

First, I'll create a brand new empty Clojure project.

```
$ lein new app todo
```

For me, that creates this directory structure.

```
todo
├── CHANGELOG.md
├── doc
│   └── intro.md
├── LICENSE
├── project.clj
├── README.md
├── resources
├── src
│   └── todo
│       └── core.clj
└── test
    └── todo
        └── core_test.clj

6 directories, 7 files
```

Most of this isn't relevant right now, because this is a generic app in Clojure,
but we're starting in Clojurescript. We'll come back to the Clojure part of the
app later, so don't delete anything just yet.

### Shadow CLJS

---

Shadow cljs is configured via a root level `shadow-cljs.edn` file.

```clojure
;; /shadow-cljs.edn
{:lein true
 :dev-http {8080 "public"}
 :builds
 {:frontend {:target :browser
             :output-dir "public/js/compiled"
             :asset-path "/js/compiled"
             :modules
             {:main {:init-fn frontend.todo.core/init}}}}}
```
`lein` means we're deferring to leiningen for dependencies

`dev-http` is configuration for a development http server. This'll serve `/public` from 8080.

`builds.frontend.main.init-fn` is the function that's going to get called to
start the app.  It doesn't exist yet, so this'll crash.

That should be all the configuration we need for shadow cljs.  This file won't
change again.

### Leiningen

---

Before we can run anything, I need shadow-cljs as a dependency. Leiningen
is configured through `/project.clj`.  It has a lot of options, but for now I'm
only interested in dependencies.  To find versions, the leiningen cli comes with
a `search` command that'll ouput available libraries and versions.  I found that
`2.8.83` is the latest version of shadow-cljs.

```clojure
(defproject todo "0.1.0-SNAPSHOT"
  ;; ...
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [thheller/shadow-cljs "2.8.83"]])
```

That should be all the configuration required to compile our code.  I can
compile all the cljs files with this command (run from the root).

```
$ shadow-cljs watch frontend
```
> <small>If you don't have shadow-cljs installed globally, you'll have to run this via
> npx or something. </small>

It's not totally done, because nothing shows up in the browser -- there is no
`index.html`. That watch command should have created a `/public` directory, so
I'll create it there.  This is just a placeholder for now, we'll update it
later.

```html
<html>
  <body>
    <div>
      hi
    </div>
    <script src="/js/compiled/main.js"></script>
  </body>
</html>
```
> <small>I ended up ignoring the public directory, except index.html.  </small>

### React/Reagent

---

Now that we've got a compiling and running client, let's add React so we can
build a browser app like it's 2020.  There's a React wrapper called Reagent that
I like.  It's simple and easy to understand.  Let's add that.

First off, we have to add it as a dependency to our project.  Just like before,
I run `lein search reagent`, and get the most recent release, `0.9.0-rc4` in
this case.  I go to my `project.clj` and update the dependencies.

```clojure
:dependencies [[org.clojure/clojure "1.10.0"]
               [thheller/shadow-cljs "2.8.83"]
               [reagent "0.9.0-rc4"]]
```
> <small>You can manually update dependencies with `lein deps` or you can 
> restart the app and they should be installed automatically.</small>

We have to update out index.html. I swapped out the body for an empty div with
`id="app"`.  The js script is still required.

```html
<html>
  <body>
    <div id="app"></div>
    <script src="/js/compiled/main.js"></script>
  </body>
</html>
```

To use Reagent, I need to build a component and mount that component into the
DOM, just like React.

> <small>Reagent components are just vectors where the first element is either a symbol
> for a native dom node, or a component you wrote.  The nice part about this is
> that all you cljs functions work with them out of the box.</small>

Updating our core namespace to render a comp-sci classic into the new `#app`
div.

```clojure
(ns frontend.todo.core
  (:require [reagent.core :as r]))

(defn start []
  (r/render
   (fn [] [:span "hello world"])
   (.getElementById js/document "app")))

(defn init []
  (println "starting todo app")
  (start))
```

That's our working single page application. It should compile and work.  The
only problem is that it's a little too old school.  Reloading the page every
change? No way, let's enable hot reloading so we can see things update in place.

#### Hot reloading

> <small>Clojure supports adding metadata on most values using a `^:vals` reader macro.</small>

Shadow CLJS can read metadata and run functions at various points in the
compilation lifecycle.  Adding hot-reloading is as easy as one piece of metadata
to `start`.

```clojure
(defn ^:dev/after-load start []
  (r/render
   (fn [] [:span "hi world"])
   (.getElementById js/document "app")))
```

With that, we should be able to live reload and iteratively build whatever we
want.  The reason live reloading is so easy in Clojurescript is because of how
the Google Closure Compiler "modules".  Clojurescript namespaces are compiled to
global js objects.  A namespace symbol like `frontend.todo.core` would compile
to js output like

```js
frontend = {
    todo: {
        core: {
            start: function() {...}
        }
    }
}
```

This makes refreshing those values after they've been compiled trivial.
