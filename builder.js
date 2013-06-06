module.exports = builder

function builder() {

    var stepTable = {

    }

    var testQueue = []

    var scenario = function scenario(name, options, steps) {
        testQueue.push({
            name: name,
            options: options,
            steps: steps
        })
    }

    scenario.step = step
    scenario.validate = validate
    scenario.names = names
    scenario.build = build
    return scenario

    function step(name, test) {
        if (name in stepTable) {
            throw new Error("Test step is already defined")
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
                if (!(step.name in stepTable)) {
                    missing.push(step.name)
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

        return testQueue.map(function (scenario) {
            var tapeSteps = scenario.steps.map(function (step) {
                var stepFunction = stepTable[step]
                return {
                    name: step.name,
                    run: stepFunction
                }
            })

            return function (test) {
                test(scenario.name, function (assert) {
                    var context = createContext(scenario.options)

                    tapeSteps.forEach(function (step) {
                        assert.test(step.name, function (assert) {
                            step.run(context, function () {
                                assert.done()
                            })
                        })
                    })

                    assert.done()
                })

            }
        })
    }

    // Returns a list of queued scenarios
    function names() {
        return testQueue.map(function (test) {
            return test.Name
        })
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