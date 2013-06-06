#!/usr/bin/env node

var allFiles = require("all-files")
var args = require("optimist").argv
var console = require("console")
var tape = require("tape")

var builder = require("../index")
console.log(args)

var config = args.c || args.config
var path = args.p || args.path

if (!(path || config) || (path && config)) {
    printHelp()
} else {

    if (config) {
        runTests(filesFromConfig(config))
    } else if (args.p || args.path) {
        console.log(allFiles(path))
        runTests(allFiles(path))
    }
}

function runTests(fileList) {
    var scenario = builder()

    fileList.forEach(function (fileName) {
        var featureFile = require(fileName)
        featureFile(scenario)
    })

    scenario.build().forEach(function (test) {
        test(tape)
    })
}


function filesFromConfig(configPath) {
    var config = require(configPath)

    if (!config.isArray) {
        throw new Error("Config " +
            configPath +
            " file is not a valid JSON array")
    }

    return config
}

function printHelp() {
    console.log("LOL")
}
