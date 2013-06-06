var test = require("tape")

var builder = require("../index")


test("Valid scenarios", function (assert) {

    assert.test("Scenario 1 is valid", function (assert) {
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


    assert.test("Scenario 2 is valid", function (assert) {
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

    assert.test("Scenario 1 composed with 2 is valid", function (assert) {
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
    var scenario = builder()
    var expected = "Test step is already defined: " + feature1steps[0]
    var failed = false

    feature1(scenario)

    try {
        scenario.define(feature1steps[0], function () {})
    } catch (e) {
        failed = e.message
    }

    assert.equal(failed, expected, "An exception was thrown on duplicate steps")

    assert.end()
})


// Missing steps
test("Missing steps", function (assert) {
    var scenario = builder()
    var expected = "Missing steps: " + JSON.stringify(undefineSteps)
    var failed = false

    featureUndefined(scenario)
    var missing = scenario.validate()

    try {
        scenario.build()
    } catch (e) {
        failed = e.message
    }

    assert.deepEqual(missing, undefineSteps)
    assert.equal(failed, expected, "An exception was thrown on build with missing steps")
    assert.end()
})



// Test data

var feature1scenarios = ["This is a scenario for feature 1"]
var feature1steps = [
    "Given that I am ready to test feature 1",
    "When I test feature 1",
    "Then feature 1 works"
]

function feature1(scenario) {

    scenario("This is a scenario for feature 1", feature1steps)

    scenario.define("Given that I am ready to test feature 1",
        function (context, assert) {
            context.feature1ready = true
            assert.end()
        })

    scenario.define("When I test feature 1",
        function (context, assert) {
            assert.equal(context.feature1ready, true)
            context.feature1done = true
            assert.end()
        })

    scenario.define("Then feature 1 works",
        function (context, assert) {
            assert.equal(context.feature1done, true)
            assert.end()
        })
}

var feature2scenarios = ["This is a scenario for feature 2"]
var feature2steps = [
    "Given that I am ready to test feature 2",
    "When I test feature 2",
    "Then feature 2 works"
]

function feature2(scenario) {

    scenario("This is a scenario for feature 2", feature2steps)

    scenario.define("Given that I am ready to test feature 2",
        function (context, assert) {
            context.feature2ready = true
            assert.end()
        })

    scenario.define("When I test feature 2",
        function (context, assert) {
            assert.equal(context.feature2ready, true)
            context.feature2done = true
            assert.end()
        })

    scenario.define("Then feature 2 works",
        function (context, assert) {
            assert.equal(context.feature2done, true)
            assert.end()
        })
}

var undefinedScenarios = ["This is a scenario for undefined features"]
var undefineSteps = ["Given that there are three cats in the garden"]
function featureUndefined(scenario) {
    scenario("This is a scenario for undefined features", [
            "Given that there are three cats in the garden"
        ])
}