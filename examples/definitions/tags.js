module.exports = function tag(scenario) {

    scenario.tag("web", function (context) {
        context.setup = "The tag worked"
    })
}