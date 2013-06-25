var test = require("tape")

var builder = require("../index")

test("Scenario 1 is valid", function (assert) {
    var scenario = builder()

    feature1(scenario)
    var scenarios = scenario.scenarios()
    var steps = scenario.steps()
    var missing = scenario.validate()
    var tests = scenario.build()

    assert.deepEqual(scenarios, feature1scenarios, "Scenarios are correct")
    assert.deepEqual(steps, feature1steps, "Steps are correct")
    assert.deepEqual(missing, [], "No steps are missing")
    assert.equal(tests.length, 1, "The correct number of tests were produced")

    tests[0](assert.test.bind(assert))

    assert.end()
})


test("Scenario 2 is valid", function (assert) {
    var scenario = builder()

    feature2(scenario)
    var scenarios = scenario.scenarios()
    var steps = scenario.steps()
    var missing = scenario.validate()
    var tests = scenario.build()

    assert.deepEqual(scenarios, feature2scenarios)
    assert.deepEqual(steps, feature2steps)
    assert.deepEqual(missing, [])
    assert.equal(tests.length, 1)

    tests[0](assert.test.bind(assert))

    assert.end()
})

test("Scenario 3 is valid", function (assert) {
    var scenario = builder()

    feature3(scenario)
    var scenarios = scenario.scenarios()
    var tests = scenario.build()
    var steps = scenario.steps()
    var missing = scenario.validate()

    assert.deepEqual(scenarios, feature3scenarios)
    assert.deepEqual(steps, feature3steps)
    assert.deepEqual(missing, [])
    assert.equal(tests.length, 1)

    tests[0](assert.test.bind(assert))

    assert.end()
})

test("Scenario 4 is valid", function (assert) {
    var scenario = builder()

    feature4(scenario)
    var scenarios = scenario.scenarios()
    var tests = scenario.build()
    var steps = scenario.steps()
    var missing = scenario.validate()

    assert.deepEqual(scenarios, feature4scenarios)
    assert.deepEqual(steps, feature4steps)
    assert.deepEqual(missing, [])
    assert.equal(tests.length, 1)

    tests[0](assert.test.bind(assert))

    assert.end()
})

test("Scenario 1 composed with 2 is valid", function (assert) {
    var scenario = builder()

    feature1(scenario)
    feature2(scenario)
    var scenarios = scenario.scenarios()
    var steps = scenario.steps()
    var missing = scenario.validate()
    var tests = scenario.build()

    assert.deepEqual(scenarios, feature1scenarios.concat(feature2scenarios), "Scenarios are correct")
    assert.deepEqual(steps, feature1steps.concat(feature2steps), "Steps are correct")
    assert.deepEqual(missing, [], "No steps are missing")
    assert.equal(tests.length, 2, "The correct number of tests were produced")

    var t = assert.test.bind(assert)
    tests[0](t)
    tests[1](t)

    assert.end()
})

test("Scenario 1 composed with 3 is valid", function (assert) {
    var scenario = builder()

    feature1(scenario)
    feature3(scenario)
    var scenarios = scenario.scenarios()
    scenario.buildRegexp()
    var steps = scenario.steps()
    var missing = scenario.validate()
    var tests = scenario.build()

    assert.deepEqual(scenarios, feature1scenarios.concat(feature3scenarios), "Scenarios are correct")
    assert.deepEqual(steps, feature1steps.concat(feature3steps), "Steps are correct")
    assert.deepEqual(missing, [], "No steps are missing")
    assert.equal(tests.length, 2, "The correct number of tests were produced")

    var t = assert.test.bind(assert)
    tests[0](t)
    tests[1](t)

    assert.end()
})

// Duplicate scenario
test("Duplicate scenarios", function (assert) {
    var scenario = builder()
    var expected = "Scenario already defined: " + feature1scenarios[0]
    var failed = false

    feature1(scenario)

    try {
        feature1(scenario)
    } catch (e) {
        failed = e.message
    }

    assert.equal(failed, expected, "An exception was thrown on duplicate scenarios")

    assert.end()
})


// Duplicate step
test("Duplicate steps", function (assert) {

    assert.test("String steps", function (assert) {
        var scenario = builder()
        var expected = "Test step is already defined: " + feature1steps[0]
        var failed = false

        feature1(scenario)

        try {
            scenario.define(feature1steps[0], null)
        } catch (e) {
            failed = e.message
        }

        assert.equal(failed, expected, "An exception was thrown on duplicate steps")

        assert.end()
    })

    assert.test("Regex steps", function (assert) {
        var scenario = builder()
        var expected = "Test step is already defined: " + feature3steps[0]
        var failed = false

        feature3(scenario)

        try {
            scenario.define(feature3definedSteps[0], null)
        } catch (e) {
            failed = e.message
        }

        assert.equal(failed, expected, "An exception was thrown on duplicate regex steps")

        assert.end()
    })

    assert.end()
})


// Missing steps
test("Missing steps", function (assert) {
    var scenario = builder()
    var expected = "Missing steps: " + JSON.stringify(undefineSteps)
    var failed = false

    featureUndefined(scenario)

    scenario.define("Any String", null)
    scenario.define(/^A Regex$/, null)

    var missing = scenario.validate()

    try {
        scenario.build()
    } catch (e) {
        failed = e.message
    }

    assert.deepEqual(missing, undefineSteps)
    assert.equal(failed, expected, "Exception thrown on build with missing steps")
    assert.end()
})

test("Poorly defined step", function (assert) {
    var scenario = builder()
    var expected = "Invalid step definition: undefined"

    var failed = false;

    try {
        scenario.define(undefined, null)
    } catch (e) {
        failed = e.message
    }

    assert.equal(failed, expected, "Exception thrown on a poorly defined step")
    assert.end()
})


test("Arguments are passed between steps", function (assert) {
    var scenario = builder()

    feature5(scenario)
    var scenarios = scenario.scenarios()
    var steps = scenario.steps()
    var missing = scenario.validate()
    var tests = scenario.build()

    assert.deepEqual(scenarios, feature5scenarios, "Scenarios are correct")
    assert.deepEqual(steps, feature5steps, "Steps are correct")
    assert.deepEqual(missing, [], "No steps are missing")
    assert.equal(tests.length, 1, "The correct number of tests were produced")

    tests[0](assert.test.bind(assert))

    assert.end()
})

test("Tags work", function (assert) {
    for (var i = 0; i < 4; i += 1) {
        assert.test("Testing definition order 1", function (assert) {
            var scenario = builder()

            feature6(scenario)
            tags(scenario, i)
            var scenarios = scenario.scenarios()
            var steps = scenario.steps()
            var missing = scenario.validate()
            var tests = scenario.build()

            assert.deepEqual(scenarios, feature6scenarios, "Scenarios are correct")
            assert.deepEqual(steps, feature6steps, "Steps are correct")
            assert.deepEqual(missing, [], "No steps are missing")
            assert.equal(tests.length, 1, "The correct number of tests were produced")

            tests[0](assert.test.bind(assert))

            assert.end()
        })
    }

    assert.end()
})

var methods = ["before", "after", "beforeEach", "afterEach"]
methods.forEach(function (t) {
    var worked = false;

    test("Testing " + t + " only", function (assert) {
        var scenario = builder()

        feature7(scenario)
        scenario[t]("magic", function (context, assert) {
            worked = true;
            assert.end()
        })

        var scenarios = scenario.scenarios()
        var steps = scenario.steps()
        var missing = scenario.validate()
        var tests = scenario.build()

        assert.deepEqual(scenarios, feature7scenarios, "Scenarios are correct")
        assert.deepEqual(steps, feature7steps, "Steps are correct")
        assert.deepEqual(missing, [], "No steps are missing")
        assert.equal(tests.length, 1, "The correct number of tests were produced")

        tests[0](assert.test.bind(assert))

        assert.end()
    })

    test("Assert test worked", function (assert) {
        assert.ok(worked)
        assert.end()
    })
})





// String test data

var feature1scenarios = ["This is a scenario for feature 1"]
var feature1steps = [
    "I am ready to test feature 1",
    "I test feature 1",
    "feature 1 works"
]

function feature1(scenario) {

    scenario("This is a scenario for feature 1", feature1steps)

    scenario.define("I am ready to test feature 1",
        function (context, assert) {
            context.feature1ready = true
            assert.end()
        })

    scenario.define("I test feature 1",
        function (context, assert) {
            assert.equal(context.feature1ready, true)
            context.feature1done = true
            assert.end()
        })

    scenario.define("feature 1 works",
        function (context, assert) {
            assert.equal(context.feature1done, true)
            assert.end()
        })
}

var feature2scenarios = ["This is a scenario for feature 2"]
var feature2steps = [
    "I am ready to test feature 2",
    "I test feature 2",
    "feature 2 works"
]

function feature2(scenario) {

    scenario("This is a scenario for feature 2", feature2steps)

    scenario.define("I am ready to test feature 2",
        function (context, assert) {
            context.feature2ready = true
            assert.end()
        })

    scenario.define("I test feature 2",
        function (context, assert) {
            assert.equal(context.feature2ready, true)
            context.feature2done = true
            assert.end()
        })

    scenario.define("feature 2 works",
        function (context, assert) {
            assert.equal(context.feature2done, true)
            assert.end()
        })
}

var undefinedScenarios = ["This is a scenario for undefined features"]
var undefineSteps = ["there are three cats in the garden"]
function featureUndefined(scenario) {
    scenario("This is a scenario for undefined features", [
            "there are three cats in the garden"
        ])
}

/* RegExp test data */
var feature3scenarios = ["This is a scenario for feature 3"]
var feature3steps = [
    "I am ready to test feature 3",
    "I test feature 3",
    "feature 3 works"
]
var feature3definedSteps = [
    /^I am ready to test feature 3$/,
    /^I test feature 3$/,
    /^feature 3 works$/
]

function feature3(scenario) {

    scenario("This is a scenario for feature 3", feature3steps)

    scenario.define(/^I am ready to test feature 3/,
        function (context, assert) {
            context.feature3ready = true
            assert.end()
        })

    scenario.define(/^I test feature 3$/,
        function (context, assert) {
            assert.equal(context.feature3ready, true)
            context.feature3done = true
            assert.end()
        })

    scenario.define(/^feature 3 works$/,
        function (context, assert) {
            assert.equal(context.feature3done, true)
            assert.end()
        })
}

var feature4scenarios = ["This is a scenario for feature 4"]
var feature4steps = [
    "I am ready to test feature 4",
    "I test feature 4",
    "feature 4 works"
]
var feature4definedSteps = [
    /^I am ready to test feature 4$/,
    /^I test feature 4$/,
    /^feature 4 works$/
]

function feature4(scenario) {

    scenario("This is a scenario for feature 4", feature4steps)

    scenario.define(/^I am ready to test feature 4/,
        function (context, assert) {
            context.feature4ready = true
            assert.end()
        })

    scenario.define(/^I test feature 4$/,
        function (context, assert) {
            assert.equal(context.feature4ready, true)
            context.feature4done = true
            assert.end()
        })

    scenario.define(/^feature 4 works$/,
        function (context, assert) {
            assert.equal(context.feature4done, true)
            assert.end()
        })
}

var feature5scenarios = ["This is a scenario for feature 5"]
var feature5steps = [
    "I test feature 5",
    "feature 5 works"
]

function feature5(scenario) {

    scenario("This is a scenario for feature 5", feature5steps)

    scenario.define(/^I ([a-zA-Z]+) feature 5$/,
        function (context, assert, action) {
            context.action = action
            assert.equal(action, "test")
            assert.end()
        })

    scenario.define(/^feature 5 works$/,
        function (context, assert) {
            assert.equal(context.action, "test")
            assert.end()
        })
}

var feature6scenarios = ["This is a scenario for feature 6"]
var feature6steps = [
    "I test feature 6",
    "feature 6 works"
]

function feature6(scenario) {

    scenario("This is a scenario for feature 6", feature6steps, ["magic", "undefined"])

    scenario.define(/^I ([a-zA-Z]+) feature 6$/,
        function (context, assert, action) {
            assert.equal(context.result, "setup data")
            context.action = action
            assert.equal(action, "test")
            assert.end()
        })

    scenario.define(/^feature 6 works$/,
        function (context, assert) {
            assert.equal(context.action, "test")
            assert.end()
        })
}

var feature7scenarios = ["This is a scenario for feature 7"]
var feature7steps = [
    "I test feature 7",
    "feature 7 works"
]

function feature7(scenario) {

    scenario("This is a scenario for feature 7", feature7steps, ["magic"])

    scenario.define(/^I ([a-zA-Z]+) feature 7$/,
        function (context, assert, action) {
            context.action = action
            assert.equal(action, "test")
            assert.end()
        })

    scenario.define(/^feature 7 works$/,
        function (context, assert) {
            assert.equal(context.action, "test")
            assert.end()
        })
}

var magic = [
    function magicBefore(scenario) {
        scenario.before("magic", function (context, assert) {
            context.result = "setup data"
            assert.end()
        })
    },

    function magicAfter(scenario) {
        scenario.after("magic", function (context, assert) {
            assert.equal(context.result, "setup data")
            assert.equal(context.count, 0)
            assert.end()
        })
    },

    function magicBeforeEach(scenario) {
        scenario.beforeEach("magic", function (context, assert) {
            if ("count" in context) {
                context.count += 1
            } else {
                context.count = 1
            }

            assert.end()
        })
    },

    function magicAfterEach(scenario) {
        scenario.afterEach("magic", function (context, assert) {
            context.count -= 1
            assert.end()
        })
    }
]

function tags(scenario, order) {
    var i, t;
    for (i = 0; i < magic.length; i += 1) {
        t = (i + order) % magic.length
        magic[t](scenario)
    }
}

