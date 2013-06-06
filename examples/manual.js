var test = require("tape")

var scenario = require("../index")()

// Load a scenario definition
var feature = require("./featureFiles/example.js")

// Register the scenarios with the test builder
feature(scenario)

// Build the tape tests
var tests = scenario.build()

// Run the tests
tests[0](test)
