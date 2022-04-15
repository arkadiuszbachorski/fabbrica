**fabbrica** is TypeScript and JavaScript library for creating object factories that will make your mocking and testing a breeze!

## Key features:

* Extensible, data source agnostic
* Lazy-evaluated
* Supports various states (traits), extending and picking
* Minimal, elegant, declarative API
* Built with TypeScript
* Zero dependencies

Inspired by [factory_boy](https://github.com/FactoryBoy/factory_boy) and [Laravel's factories](https://github.com/laravel/laravel)

# Usage

## Installation

You can use any data source you want with **fabbrica**. In the examples we are going to use [Faker](https://github.com/faker-js/faker) and we can recommend it!

`yarn add fabbrica @faker-js/faker`

## Defining factories

```typescript
import { Factory } from 'fabbrica';
import faker from '@faker-js/faker';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
};

class UserFactory extends Factory<User> {
  define = {
    id: () => faker.datatype.uuid(),
    email: () => faker.internet.email(),
    name: () => faker.name.findName(),
    age: () => faker.datatype.number({ min: 1, max: 99 }),
  };
}
```

In this example `UserFactory` extends **fabbrica**'s `Factory` with interface `User`. This makes us confident that definition of the `Factory` matches `User` model.

Keys of the field `define` can be both functions and expressions. Expressions are evaluated once, per factory definition and never change. Functions are lazy-evaluated when you call `create`.

Since first three keys are functions already we don't want to pass anything to them, we can simplify the definition:

```typescript
class UserFactory extends Factory<User> {
  define = {
    id: faker.datatype.uuid,
    email: faker.internet.email,
    name: faker.name.findName,
    age: () => faker.datatype.number({ min: 1, max: 99 }),
  };
}
```

## Creating objects

With defined factory you can now create `User` object:

```typescript
const user = new UserFactory().create(); // User
```

Simply pass number of `Users` if you want to create many of them:

```typescript
const users = new UserFactory().create(4) // [User, User, User, User]
```


## Overriding data

Sometimes you want to override data with specific, case determined values. It's simple:

```typescript
const me = new UserFactory()
  .override({
    id: '58fca697-2ab1-4a08-a8f1-8473c5979f10',
    name: 'Arkadiusz Bachorski',
  })
  .create();

/*
{
  id: '58fca697-2ab1-4a08-a8f1-8473c5979f10',
  email: <random>,
  name: 'Arkadiusz Bachorski',
  age: <random>,
}
*/
```

You can pass both functions and expressions to the `override` method, just like to the `define` field. In this case `faker.datatype.uuid` and `faker.name.findName` will never be called, since they're overrided. 

## Implementing reusable states

You can easily create specific, reusable and chainable states. Just return `override` call of the `Factory` class in your custom method:

```typescript
class UserFactory extends Factory<User> {
  define = {
    id: faker.datatype.uuid,
    email: faker.internet.email,
    name: faker.name.findName,
    age: () => faker.datatype.number({ min: 1, max: 99 }),
  };

  me() {
    return this.override({
      id: '58fca697-2ab1-4a08-a8f1-8473c5979f10',
      name: 'Arkadiusz Bachorski',
    })
  }
  
  exampleEmail(user: string) {
    return this.override({
      email: `${user}@example.com`,
    })
  }

  old() {
    return this.override({
      age: () => faker.datatype.number({ min: 90, max: 99 }),
    })
  }
}

const oldMe = new UserFactory()
  .me()
  .old()
  .exampleEmail('arkadiusz')
  .create()

/*
{
  id: '58fca697-2ab1-4a08-a8f1-8473c5979f10',
  email: 'arkadiusz@example.com',
  name: 'Arkadiusz Bachorski',
  age: <random between 90 - 99>,
}
*/
```

Remember to `return` `this.override` result! It allows you to chain methods.

## Nested factories

You can simply pass factory as part of the definition if your types are matching. 

```typescript
type BlogPost = {
    id: string;
    content: string;
    user: User;
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        id: 'uuid',
        content: 'Lorem ipsum',
        user: UserFactory,
    }
}
```

As simple as that!

If you need an array of nested objects, utilize `many` helper function

```typescript
type BlogPost = {
    id: string;
    content: string;
    users: User[];
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        id: 'uuid',
        content: 'Lorem ipsum',
        user: many(UserFactory, { min: 2, max: 5 }),
    }
}
```

## Repeatable data series

You can use `sequence` helper if you need repeatable data sequences in your factories.

```typescript
type BlogPost = {
    variant: string
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        variant: sequence(['long', 'short', (index) => `long-${index}`])
    }
}

const variants = new BlogPostFactory().create(5).map(post => post.variant);
// [ 'long', 'short', 'long-2', 'long', 'short' ]

```

If you need only sequence function:

```typescript
class BlogPostFactory extends Factory<BlogPost> {
    define = {
        variant: sequence((index) => `variant-${index}`)
    }
}

const variants = new BlogPostFactory().create(5).map(post => post.variant);
// [ 'variant-0', 'variant-1', 'variant-2', 'variant-3', 'variant-4' ]
```


## Probability

You can use `chance` helper if you need to add possibility to your factories.

```typescript
type BlogPost = {
    variant: 'long' | 'short' | 'unique'
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        variant: chance([
            [4, 'long'], // 4/10 chance for `long`
            [5, 'short'], // 5/10 chance for `short`
            [1, 'unique'], // 1/10 chance for `unique`
        ])
    }
}

```

**fabbrica** also exposes `orNull` and `orUndefined` helpers, which resolves common cases like `T | null`.

```typescript
type BlogPost = {
    variant: 'long' | null
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        variant: orNull('long', 80) // 80% "long", 20% null
    }
}
```

If you would like to create your own `orX` helper, you can use `simpleChanceCreator`.

```typescript
export const orEmptyString = <T>(value: T, chance = 80) => {
    return simpleChanceCreator(value, chance, '');
}
```


## Picking fields

Picking fields allows you to take advantage of your factories goods and keep the execution fast.

```typescript
type BlogPost = {
    id: string;
    name: string;
    content: string; 
}

class BlogPostFactory extends Factory<BlogPost> {
    define = {
        id: faker.datatype.uuid,
        name: faker.lorem.words,
        content: veryExpensiveCaluclation
    }
}
```

If you need only `id`

```typescript
const blogWithIdOnly = new BlogPostFactory().pick(['id']).create();
```

If you need everything besides expensive `content`

```typescript
const blogWithoutContent = new BlogPostFactory().omit(['content']).create();
```

You must always call `pick` and `omit` before `create`.

## Extending factories

Factories, just like types, are extensible in their natures. All you have to do is spread desired `define` fields into the new factory `definition`

```typescript
type BlogPostList = {
    id: string;
    name: string;
    isFavorite: boolean;
}

type BlogPostDetails = Omit<BlogPostList, 'isFavorite'> & {
    content: string;
}

class BlogPostListFactory extends Factory<BlogPostList> {
    define = {
        id: faker.datatype.uuid,
        name: faker.lorem.words,
        isFavorite: faker.datatype.boolean,
    }
}

class BlogPostDetailsFactory extends Factory<BlogPostDetails> {
    define = {
        ...new BlogPostListFactory().omit(['isFavorite']).define,
        content: veryExpensiveCaluclation
    }
}
```

## More examples

If you need more examples, you can go through `src/__tests__`.
