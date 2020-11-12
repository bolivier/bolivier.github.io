---
title: "Code Smells: complex data props"
description: it's getting smelly in here.
date: 2020-02-11
tags: ["javascript", "refactoring"]
---

> Code Smell (n): a surface indication that usually corresponds to a deeper
> problem in the system.

I was reviewing some code I wrote a while ago and saw something that I think is
a pretty big api design error.

I was working in React and was looking at a `<Select` and the props looked something like this

```js
<Select
  options={[{name: "foo" value: 'bar'},
            {name: 'bar', value: 'baz'}]}
  onKeyDown{specialInputHandler}
/>
```

`specialInputHandler` in this case needed to modify the default tab
behavior. Aaand, that's not supported by this api. I looked into trying to
restructure the api to handle it, and things get messy. You need all kinds of
checks, you have to decide what _kinds_ of events are interceptable or
modifiable.

It's just bad. It's smelly.

A better solution would be to have a design more like the actual browser implementation.

```js
<Select>
  <SelectItem selected name="foo" value="bar" />
  <SelectItem name="bar" value="baz" />
</Select>
```

This is better, not only because it allows arbitrary control of all events by
the end user (aka, another programmer), but also because it means I can put my
own components inthere and I'm not beholden to some foreign code to implement
things how I like them.

What if I wanted more control over what these items looked like? Now I can
easily provide it. As a consumer, I can dynamically inject whatever I want into
that code.

I simultaneously encountered this phenomenon while working on a React Native
project. I was using `createStackNavigator` which took a massiv configuration
object to represent what screen was going to be visible. I found myself needing
to inject other components in that navigator, for context purposes. I couldn't
do it and I cried a little bit to myself at my desk. But then, fortune smiled
upon me. The [latest release of React Navigation][1] supports a new composable api
like the one I described above!

[1]: https://reactnavigation.org/blog/2020/02/06/react-navigation-5.0.html

I still think there's a place for an all data api. It's nice to have reasonable
defaults set up so I can just feed in some data. However, not providing the
lower level composable api would be a mistake.
