---
title: Reducing Boilerplate in Redux
date: 2018-09-12
description: Some ways I tried to make Redux more pleasant
---

edit: at this point, I'd reccomend [the redux starter kit][1]

[1]: https://redux-starter-kit.js.org/

## The Problem

I end up writing a lot of Redux code and one of the things that
irritates me most is writing code that's so very nearly identical for
top level items in the application state.

To quickly recap, reducers are pure functions that take `state` and
`action` as arguments. Based on the `type` property of `action`,
it makes a change to the state and returns a new copy of it. You can
read more about Redux at *the Redux docs*.

I might write something like

```javascript
export const todoReducer = (state, action) => {
  switch(action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: {...state.todos, [action.payload.id]: ...action.payload},
      };
    default:
      return state;
  }
};
```

to add a new todo to a todo application.

My issue with this code is that I'm going to duplicate the same adding
logic for all my reducers with "add" behavior. I don't think it's so
much bad practice as irritating to lazy programmers like me who don't
want to type all that.

## My solution

What I would really like is something where I could specify a generic
addition function and use it across reducers. The syntax I imagine for
something like that is

```javascript
// prefix -> initialState, [reducerGenerics] -> reducer
export const todoReducer = createReducer('todo', {}, ['add']);
```

I need a prefix to identify all these actions, because action types need
to be unique. I can prefix add like `todos/ADD`, where `todos` is
generated dynamically. I'll need to know initialState so I can return
that when there isn't a state passed in. And then I want to pass an
array with names I can use to look up which generic reducer function to
use and not repeat myself. Since those probably aren't going to cover
all my use cases, I'll go ahead and pass a regular reducer function
that will take precedence over the custom ones.

The code for something like that might look like

```javascript
export function createReducer(prefix, initialState, reducerGenerics, customReductions) {
  return (state, action) => {
    if (!state) {
      return initialState;
    }

    const customAlteredState = applyCustomReductions(
      customReductions,
      state,
      action
    );

    if (!_.isEqual(customAlteredState, state)) {
      return customAlteredState;
    }

    return applyGenericReductions(prefix, reducerGenerics, state, action);
  }
}
```

Redux will initially dispatch an empty state, so I need to check for
that and return the initial state if there isn't one. Then I need to
verify that my custom reductions aren't changing the state, and return
the new value if they are. It doesn't make perfect sense with the
`add` use case, but I imagine I'll want to have the ability to
override some of the reducers if they're grouped together. Finally, I
return the state after I apply my generic reductions.

### Generic reducer application

For simplicity, I want to iterate over the list of generic reductions in
order and return the first one that returns a new state. There's a
potential for hard to find bugs here if you reuse names, or if you
don't know how these generic reductions are being applied, but I don't
know how likely that's going to be in the wild.

Another downside to this is that I'm going to be potentially iterating
over a lot of states and changing them, so there could be performance
issues. I wouldn't want to use this for something like
"MOUSE/MOVELEFT" or any other actions that might be dispatched
frequently. For something like add, though, which is usually triggered
by human actions, it should suffice.

```javascript
const applyGenericReductions = (prefix, generics, state, action) => {
  const newStates = generics
    .map(name => {
      const reducer = lookupGenericReducer(genericName, prefix);
      if (reducer) {
        return reducer(state, action);
      } else {
        throw `Could not find reducer with name: ${genericName}`;
      }
    })
    .filter(newState => !_.isEqual(state, newState));
  return newStates[0] || state;
};
```

As an aside, I'm using the lodash `isEqual` method here for deep
comparison. If you're not using lodash, you can use whatever deep
equals function you like, just note that you can't use `==` or
`===`. Those don't compare deep equality.

Also note that I haven't defined what these custom reducers are going
to look like or how I'm going to retrieve them. I like programming like
this for anything atypical. It's slower than writing something that
"just works", but it forces me into writing code that's more
conceptually organized. It also removes the temptation to just commit
whatever works and let somebody else worry about figuring out what this
crap does later.

### The Generic Reducer Structure

Before I know how to retrieve one of these reducers, I should figure out
how it's going to be look. I know whatever I get back from my lookup
function needs to be another function that I can call with parameters
`state` and `action`. But in order to dispatch the correct action,
I'll need to know the prefix that this reducer is going to use.

```javascript
function addReducer(prefix) {
  const types = {
    ADD: `${prefix}/ADD`,
  };

  return (state, action) => {
    switch(action.type) {
      case types.ADD:
        return {
          ...state.todos,
          [action.payload.id]: ...action.payload,
        };
      default:
        return state;
    }
  };
}
```

To preserve the state I'm using a closure, which is just a fancy comp
sci word for functions that return functions with stored state. You can
use them like classes to hold state. I generally don't care for classes
in ES6, but the same thing as a class would be

```javascript
class crudReducer {
  constructor(prefix) {
    this.types = {
      ADD: `${prefix}/ADD`,
    };
  }

  reduce(state, action) {
    switch(action.type) {
      case types.ADD:
        return {
          ...state.todos,
          [action.payload.id]: ...action.payload,
        };
      default:
        return state;
    }
  }
}
```

One reason I like this less is that I have to invent a name for the
method to use. I called it reduce because I think that makes sense, but
it's simpler for me to ignore that detail and just use a function, I
think. I'm going to proceed using the function version.

### Getting the generic reducers

Now I can turn my attention to getting the reducers. I need a way to
pass in the prefix and return the reducer.

```javascript
const lookupGenericReducer = (name, prefix) => reducerRegistry[name](prefix);
```

This is about as brain dead as I can make anything.

If I organize a directory with all your generic reducers, you can export
them all from an index and import them all from one place with something
like

`src/genericReducers/index.js`

```javascript
export { addReducer } from './addReducer'
```

`src/reducers/todoReducer.js`

```javascript
import * as reducerRegistry from '../genericReducers';
```

### Custom Reducer Functions

I need a way to add additional, non generic, functionality to my
reducers. Sometimes I may need to do something more specific than
"add".

Luckily, `createReducer` will take a custom reducer function. I can
write something like

```javascript
export const todoReducer = createReducer('todo', {}, ['add'], (state, action) => {
  switch (action.type) {
    case 'DELETE_TODO':
      const newState = { ...state };
      delete newState[action.payload.id];
      return newState;
    default: 
      return state;
  }
});
```

The function in `createReducer` that will handle that is called
`applyCustomReductions`. If that function returns a value different
than the current state, I can short circuit and just return the state it
generates.

The code is similar to the custom reducer code, but it doesn't need to
handle multiple functions that change the state.

```javascript
const applyCustomReductions = (customReductions, initialState, action) => {
  if (customReductions) {
    return customReductions(initialState, action);
  } else {
    return initialState;  
  }
};
```

Now I have all the pieces to write generic reducer functions. If I want
a function to update, I just need to write an `updateReducer` that
will take a prefix, and return a function with parameters `state` and
`action` and include it in the `genericReducers` argument.

## Downsides

There are a few weaknesses to this approach.

### Action Types

First, it relies on convention to determine the types. I have to know
the way that they're going to be generated and expect that.

A potential solution to that is to refactor `createReducer` to return
an object with `reducer` and `types`, but I think you're starting
to betray the name in that case. It's not *just* creating a reducer,
it's generating types. I could create a new function called
`createTypes` or something, and reference that, but then I've still
got to know which types are going to be returned in that object to use
them.

For now, I'm okay just knowing a convention exists. I'd add a
readme.md in the directory that explained that, and just leave it at
that for now.

### Additional Abstractions

This is a more complex system because it includes a new step. There are
new concepts here: generic reducers, implicit action types, etc. I have
to anticipate those things and know how to use and debug them. If I come
to the codebase, I have to figure out how to add generic functionality
with, let's face it, probably no documentation about it.

### Nonstandard Code

Maybe worst of all, this is a nonstandard concept. I'm not going to be
able to Google problems I have, because I wrote this code. I'm going to
have to read the code and figure it out myself. Standard solutions are
nice because if you have a problem, chances are somebody else has too.
This is an in-house solution to reducing boilerplate, and that means I
have to read the code.

### Performance

Given that I'm iterating over multiple potential state changes and - in
this iteration - not short circuiting when I find a change, there's a
possibility of substantially impacting performance. However, I think the
cases where that might be a problem are easily solvable by either not
using this solution, or by passing in custom reductions that will handle
the case right away.
