# scenario

<!-- [![browser support][5]][6] -->

<!-- [![build status][1]][2] [![NPM version][7]][8] [![dependency status][3]][4] -->

System test runner based on tape. A feature of a system is tested by constructing test scenarios, each of which is
associated with a collection of named test steps. Each step is defined and implemented independently, using a context variable to pass data between steps, allowing for simple DRY code. Collections of related scenarios define test cases
for a feature.

## Example

```js
var test = require("tape")
var scenario = require("scenario")()

// Register the scenarios with the test builder
feature(scenario)

// Build the tape tests
var tests = scenario.build()

// Run the tests
tests[0](test)

// A feature definition function
function feature(scenario) {
    scenario("As a user I want to do things", [
        "Given that I am a user",
        "And I want to do things",
        "When I do the thing",
        "Something happens"
    ])

    scenario.define("Given that I am a user", function (context, assert) {
        context.user = "Matt"
        assert.end()
    })

    scenario.define("And I want to do things", function (context, assert) {
        context.thing = 1
        context.doThing = function () {
            context.thing += 1
        }
        assert.end()
    })

    scenario.define("When I do the thing", function (context, assert) {
        context.doThing()
        assert.end()
    })

    scenario.define("Something happens", function (context, assert) {
        assert.equal(context.thing, 2, "The thing happened")
        assert.end()
    })
}
```

## Installation

`npm install scenario`

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
