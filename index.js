module.exports = builder

function builder() {
    var stepPrefix = "    "

    var scenarioTable = {}
    var stepTable = {}

    var testQueue = []

    var scenario = function scenario(name, steps, options) {
        if (name in scenarioTable) {
            throw new Error("Scenario already defined: " + name)
        }

        var test = {
            name: name,
            options: options,
            steps: steps
        }

        scenarioTable[name] = test
        testQueue.push(test)
    }

    scenario.define = define
    scenario.validate = validate
    scenario.scenarios = scenarios
    scenario.steps = steps
    scenario.build = build
    return scenario

    function define(name, test) {
        if (name in stepTable) {
            throw new Error("Test step is already defined: " + name)
        }

        stepTable[name] = test
    }

    // Validate that each step exists in the steps table
    //
    // Returns a list of missing step defintions
    //
    function validate() {
        var missing = []

        testQueue.forEach(function (test) {
            test.steps.forEach(function (step) {
                if (!(step in stepTable)) {
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
                var stepFunction = stepTable[step]
                return {
                    name: step,
                    run: stepFunction
                }
            })

            return function (test) {
                test(scenario.name, function (assert) {
                    var context = createContext(scenario.options)

                    tapeSteps.forEach(function (step) {
                        assert.test(stepPrefix + step.name, function (assert) {
                            step.run(context, assert)
                        })
                    })

                    assert.end()
                })

            }
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
    function createContext(options) {
        if (options) {
            // TODO - add properties to the context based on options
            return {}
        } else {
            // Return clean context
            return {}
        }
    }
}