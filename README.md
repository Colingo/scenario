# scenario

<!-- [![browser support][5]][6] -->

<!-- [![build status][1]][2] [![NPM version][7]][8] [![dependency status][3]][4] -->

Scenario is a vertical test composer based on tape. Generically speaking, it allows you to compose a set of independent test steps into multiple test scenarios. It is primarily aimed at being a system test runner for tests based on the Gherkin BDD langauge and a lightweight alternative to Cucumber.js. A feature of a system is tested by constructing test scenarios, each of which is
associated with a collection of named test steps. Each step is defined and implemented independently, using a context variable to pass data between steps, allowing for simple DRY code. Collections of related scenarios define test cases
for a feature.

## Example

```js
// index.js

var test = require("tape")
var scenario = require("scenario")()

var feature = require("example.feature.js")

// Register the scenarios with the test builder
feature(scenario)

// Build the tape tests
var tests = scenario.build()

// Run the tests
tests[0](test)
```

```js
// example.feature.js

function feature(scenario) {
    scenario("As a user I can do something", [
        "I am a user",
        "I want to do things",
        "I do the thing",
        "something happens"
    ])

    scenario.define(/^I am a user$/, function (context, assert) {
        context.user = "Matt"
        assert.end()
    })

    scenario.define(/^I want to do things$/, function (context, assert) {
        context.thing = 1
        context.doThing = function () {
            context.thing += 1
        }
        assert.end()
    })

    scenario.define(/^I do the thing$/, function (context, assert) {
        context.doThing()
        assert.end()
    })

    scenario.define(/^something happens$/, function (context, assert) {
        assert.equal(context.thing, 2, "The thing happened")
        assert.end()
    })
}
```

```gherkin
# example.feature

Feature: Example Feature

    In order to be productive,
    as a user
    I want to do things

    Scenario: A user does something

        Given I am a user
        And I want to do something
        When I do the thing
        Then something happens
    
    
```

## Tools

### Gherkin feature scaffolding

### Gherkin test runner

## Installation

`npm install scenario`

or for the gherkin tools

`npm install scenario -g`

## Contributors

 - Matt-Esch

## MIT Licenced

  [1]: https://secure.travis-ci.org/Colingo/scenario.png
  [2]: https://travis-ci.org/Colingo/scenario
  [3]: https://david-dm.org/Colingo/scenario.png
  [4]: https://david-dm.org/Colingo/scenario
  [5]: https://ci.testling.com/Colingo/scenario.png
  [6]: https://ci.testling.com/Colingo/scenario
  [7]: https://badge.fury.io/js/scenario.png
  [8]: https://badge.fury.io/js/scenario
