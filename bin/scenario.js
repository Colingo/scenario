#!/usr/bin/env node

var allFiles = require("all-files")
var args = require("optimist").argv
var console = require("console")
var tape = require("tape")
var fs = require("fs")
var ospath = require("path")

var builder = require("../index")

var config = args.c || args.config
var path = args.p || args.path

if (!(path || config) || (path && config)) {
    printHelp()
} else {

    if (config) {
        runTests(filesFromConfig(config))
    } else if (args.p || args.path) {
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
            configpath +
            " file is not a valid JSON array")
    }

    return config
}

function printHelp() {
    var help = fs.createReadStream(ospath.join(__dirname, "scenario.usage.txt"))

    help.on("open", function () {
        help.pipe(process.stdout)
    })
}
