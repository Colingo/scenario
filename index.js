module.exports = builder

function builder() {
    var stepPrefix = "    "

    var scenarioTable = {}
    var stepTable = {}

    var testQueue = []

    var tags = []

    var scenario = function scenario(name, steps, tags) {
        if (name in scenarioTable) {
            throw new Error("Scenario already defined: " + name)
        }

        var test = {
            name: name,
            steps: steps,
            tags: tags
        }

        scenarioTable[name] = test
        testQueue.push(test)
    }

    scenario.define = define
    scenario.validate = validate
    scenario.scenarios = scenarios
    scenario.steps = steps
    scenario.build = build

    scenario.before = function (tag, f) {
        var tagSetup = tags[tag] || {}
        tagSetup.before = tagSetup.before || []
        tagSetup.before.push(f)
        tags[tag] = tagSetup
    }

    scenario.after = function (tag, f) {
        var tagSetup = tags[tag] || {}
        tagSetup.after = tagSetup.after || []
        tagSetup.after.push(f)
        tags[tag] = tagSetup
    }

    scenario.beforeEach = function(tag, f) {
        var tagSetup = tags[tag] || {}
        tagSetup.beforeEach = tagSetup.beforeEach || []
        tagSetup.beforeEach.push(f)
        tags[tag] = tagSetup
    }

    scenario.afterEach = function(tag, f) {
        var tagSetup = tags[tag] || {}
        tagSetup.afterEach = tagSetup.afterEach || []
        tagSetup.afterEach.push(f)
        tags[tag] = tagSetup
    }

    function define(name, test, opt) {

        if (typeof name === "string") {
            if (name in stepTable) {
                throw new Error("Test step is already defined: " + name)
            }

            stepTable[name] = {
                test: test,
                args: Array.isArray(opt) ? opt : []
            }

        } else if (isRegex(name)) {
            var matched = []

            testQueue.forEach(function (scenario) {
                scenario.steps.forEach(function (stepName) {
                    var args = stepName.match(name)
                    var unique = matched.indexOf(stepName) === -1
                    if (args && args.length > 0 && unique) {
                        matched.push(stepName)
                    }
                })
            })

            matched.forEach(function (name) {
                define(name, test, opt)
            })
        } else {
            throw new Error("Invalid step definition: " + name)
        }
    }

    // Validate that each step exists in the steps table
    //
    // Returns a list of missing step defintions
    //
    function validate() {
        var missing = []

        testQueue.forEach(function (test) {
            test.steps.forEach(function (step) {
                var stepData = stepTable[step]
                if (!stepData || typeof stepData.test !== "function") {
                    missing.push(step)
                }
            })
        })

        return missing
    }

    // Turn each step into a callable tape test
    //
    // Returns an array of scenario tests
    //
    function build() {
        var missing = validate()

        if (missing.length > 0) {
            throw new Error("Missing steps: " + JSON.stringify(missing))
        }

        return testQueue.map(function (scenario) {
            var tapeSteps = scenario.steps.map(function (step) {
                var stepData = stepTable[step]
                return {
                    name: step,
                    run: stepData.test,
                    args: stepData.args
                }
            })

            function scenarioTest(test) {
                var context = {}

                var setupFunctions = createSetup(tags, scenario.tags)

                // Execute the scenario setup
                test(scenario.name, function (assert) {
                    assert.end()
                })

                setupFunctions.before.forEach(function (f) {
                    test("setup " + f.tagName + " scenario", function (assert) {
                        f(context, assert)
                    })
                })

                tapeSteps.forEach(function (step) {
                    setupFunctions.beforeEach.forEach(function (f) {
                        test("setup " + f.tagName + " step", function (assert) {
                            f(context, assert)
                        })
                    })

                    test(stepPrefix + step.name, function (assert) {
                        var args = [context, assert].concat(step.args)
                        step.run.apply(null, args)
                    })

                    setupFunctions.afterEach.forEach(function (f) {
                        test("teardown " + f.tagName + " step", function (assert) {
                            f(context, assert)
                        })
                    })
                })

                // Execute the sceario teardown
                setupFunctions.after.forEach(function (f) {
                    test("teardown " + f.tagName + " scenario", function (assert) {
                        f(context, assert)
                    })
                })
            }

            scenarioTest.scenario = scenario.name
            return scenarioTest
        })
    }

    // Returns an array of queued scenarios
    function scenarios() {
        return testQueue.map(function (test) {
            return test.name
        })
    }

    // Returns an array of defined steps
    function steps() {
        return Object.keys(stepTable)
    }

    return scenario
}

// Pull the setup functions from each tag in order
//
function createSetup(tags, tagNames) {
    var result = {
        before: [],
        after: [],
        beforeEach: [],
        afterEach: []
    }

    if (Array.isArray(tagNames)) {
        tagNames.forEach(function (tagName) {
            var tag = tags[tagName]
            if (tag) {
                Object.keys(result).forEach(function (key) {
                    var functions = tag[key]

                    function apply(context, assert) {
                        functions.forEach(function (f) {
                            f(context, assert)
                        })
                    }

                    apply.tagName = tagName

                    if (Array.isArray(functions)) {
                        result[key].push(apply)
                    }
                })
            }
        })
    }

    return result
}

function isRegex(obj) {
    return obj && Object.prototype.toString.apply(obj) === "[object RegExp]"
}
