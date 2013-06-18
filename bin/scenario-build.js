#!/usr/bin/env node

var fs = require("fs")
var glob = require("glob")
var Lexer = require("gherkin").Lexer("en");
var path = require("path")

var scenarios = []

var stepsTable = {}

var current = null

var lexer = new Lexer({
    comment: function(value, line) {},
    tag: function(value, line) {},
    feature: function (keyword, name, description, line) {},
    background: function (keyword, name, description, line) {},
    scenario: function(keyword, name, description, line) {
        if (current) {
            scenarios.push(current)
        }
        current = scenario(name)
    },
    scenario_outline: function(keyword, name, description, line) {},
    examples: function(keyword, name, description, line) {},
    step: function(keyword, name, line) {
        current.steps.push(name)
        stepsTable[name] = true
    },
    doc_string: function(content_type, string, line) {},
    row: function(row, line) {},
    eof: function() {
        if (current) {
            scenarios.push(current)
        }
    }
});

function scenario(name) {
    return {
        name: name,
        steps: []
    }
}

function print(scenario) {
    console.log(
        "scenario(" + quote(scenario.name) + ", [\n    " +
            scenario.steps.map(quote).join(",\n    ") +
        "])\n")
}

function define(step) {
    console.log("scenario.define(" +
        regexify(step) +
        ",\n    function (context, assert) {\n\n\n" +

        "    })\n")
}

function quote(str) {
    return "\"" + str.replace(/\"/g, "\\\"") + "\""
}

function regexify(str) {
    return "/^" + str.replace(/\//, "\\") + "$/"
}

function printHelp() {
    var help = fs.createReadStream(path.join(__dirname, "scenario-build.usage.txt"))

    help.on("open", function () {
        help.pipe(process.stdout)
    })
}

function printSteps() {
     Object.keys(stepsTable).forEach(define)
}

function printScenarios() {
    scenarios.forEach(print)
}

var argv = process.argv

if (argv.length < 3 ||
    argv[2] === "-h" ||
    argv[2] === "--help") {
    printHelp()
} else {
    var processed = 0
    var i = 2

    if (argv[2] === "-s") {
        var output = printSteps
        i += 1
    } else {
        var output = printScenarios
    }

    for (; i < argv.length; i += 1) {
        processed += 1
        glob(argv[i], function build(er, files) {
            files.forEach(function (f) {
                lexer.scan(fs.readFileSync(f));
                processed -= 1
                if (processed === 0) {
                    output()
                }
            })
        })
    }
}


