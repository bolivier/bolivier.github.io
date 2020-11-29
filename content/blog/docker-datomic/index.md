---
title: Datomic in Docker
date: "2020-11-11"
tags: ["clojure", "datomic", "databases"]
---

I watched conference talks about this weird new database called Datomic and got
really excited about it. I was ready, it was going to change how I worked.

Unfortunately, something is wrong with this picture. Setting up Datomic, for
the unfamiliar, is _hard_. Luckily, I was able to get it running. It may be
simple, but it is definitely not easy.

What finally helped me was turning off my brain and doing _exactly_ what the
docs said, without trying to figure it out. Hopefully that'll help you.

That said, I also wanted to go further, so I created a docker setup with my test
and development Datomic databases in them.

I love TDD, and I wanted to test drive my use of Datomic. Unfortunately, the
docs start you with the client api, and I can't easily start/stop in-memory
databases without the full api. I could install it, but I spent a few hours
struggling to resolve Leiningen conflicts and gave up.

Instead, I wanted to take an approach similar to what I'd heard from DHH in
Rails. Don't test in isolation. Don't mock the database. I should be able to
set up a docker container with an in-memory version of the database and run
tests against that.
