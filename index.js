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

    scenario.tag = function tag(name, handler) {
        if (tags.indexOf(name) >= 0) {
            throw new Error("Tag already defined: " + name)
        }

        tags[name] = handler
    }

    scenario.define = define
    scenario.validate = validate
    scenario.scenarios = scenarios
    scenario.steps = steps
    scenario.build = build
    return scenario

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
            testQueue.forEach(function (scenario) {
                scenario.steps.forEach(function (stepName) {
                    var args = stepName.match(name)
                    if (args && args.length > 0) {
                        define(stepName, test, args.slice(1))
                    }
                })
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
                var context

                test(scenario.name, function (assert) {
                    context = createContext(scenario.tags)
                    assert.end()
                })

                tapeSteps.forEach(function (step) {
                    test(stepPrefix + step.name, function (assert) {
                        var args = [context, assert].concat(step.args)
                        step.run.apply(null, args)
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

    // Create the context based on a set of option
    //
    // Returns a new test context
    //
    function createContext(tagNames) {
        var context = {}

        if (Array.isArray(tagNames)) {
            tagNames.forEach(function (tagName) {
                tags[tagName](context)
            })
        }

        return context
    }
}

function isRegex(obj) {
    return obj && Object.prototype.toString.apply(obj) === "[object RegExp]"
}
