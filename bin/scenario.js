#!/usr/bin/env node

var allFiles = require("all-files")
var args = require("optimist").argv
var tape = require("tape")
var fs = require("fs")
var ospath = require("path")

var builder = require("../index")

var config = args.c || args.config
var path = args.p || args.path
var single = args.s || args.single

if (!(path || config) || (path && config)) {
    printHelp()
} else {

    if (config) {
        runTests(filesFromConfig(config))
    } else if (args.p || args.path) {
        runTests(allFiles(path), single)
    }
}

function runTests(fileList, singleFile) {
    var scenario = builder()

    fileList.forEach(function (fileName) {
        var featureFile = relquire(fileName)
        featureFile(scenario)
    })

    var filterList = null

    if (singleFile) {
        var singleTest = relquire(singleFile)
        var singleScenario = builder()
        singleTest(singleScenario)
        filterList = singleScenario.scenarios()
    }

    var tests = scenario.build()

    if (filterList) {
        tests = tests.filter(function (test) {
            return filterList.indexOf(test.scenario) >= 0
        })
    }

    tests.forEach(function (test) {
        test(tape)
    })
}


function filesFromConfig(configPath) {
    var config = relquire(configPath)

    if (!Array.isArray(config)) {
        throw new Error("Config " +
            configPath +
            " file is not a valid JSON array")
    }
    
    var configDir = ospath.dirname(configPath)
    return config.map(function (testFile) {
        return ospath.join(configDir, testFile)
    })
    
}

function printHelp() {
    var help = fs.createReadStream(ospath.join(__dirname, "scenario.usage.txt"))

    help.on("open", function () {
        help.pipe(process.stdout)
    })
}

function relquire(file) {
    return require(ospath.relative(__dirname, file))
}
