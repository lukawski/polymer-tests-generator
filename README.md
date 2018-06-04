# polymer-tests-generator

> Automate your Polymer components tests creation

### What the heck is this?

Aren't your tired of manually creating tests folders/files for Polymer components? I am. And maybe, like me, you are not using `polymer-cli` to generate every new shiny component.

And here comes `polymer-tests-generator`, simple cli intended to automate this process. 🎉🎉🎉

### Installation

`npm install -g polymer-tests-generator`

`yarn global add polymer-tests-generator`

### Usage

`polymer-tests [options]`

#### CLI options

`-p, --path - specifies path in which tests generation will occur`

### Okay, but how it works ❓

Let's say you have structure like this:
```
--siema
  --demo
    -demo.html
  --elo
    -elo.1.html
    -elo2.html
  -elo.html
  -siema.html
```

Generator will search this structure looking for components. It will exclude everything from your `.gitignore` file and `demo` folder.

When it's done searching it start the magic using seed files and recursive search✨✨✨

First it checks for `test` folder and creates it if needed. Then does the same for `test/index.html` file. And lastly it creates tests **only if they don't exist for given component.**

So if you already have a test for `siema.html` it's not gonna override it.

That's it. Simple and fun when machine does it for you!

#### Seed files
* [index.html](https://github.com/lukawski/polymer-tests-generator/blob/master/index-test-seed.html)
* [test.html](https://github.com/lukawski/polymer-tests-generator/blob/master/test-suite-seed.html)

### Contributions

Feel free to create [issues](https://github.com/lukawski/polymer-tests-generator/issues/new) and [pull request](https://github.com/lukawski/polymer-tests-generator/compare).
**But please, for any new feature first create an issue so we can discuss it :)**

### Todo
- [x] update suites list in `index.html`
- [ ] improve checking if test exists
- [ ] generate tests for mixins
