module.exports = function tag(scenario) {

    scenario.before("web", function (context, assert) {
        context.setup = "The tag worked"
        assert.end()
    })

    scenario.beforeEach("web", function (context, assert) {
        if ("count" in context) {
            context.count += 1
        } else {
            context.count = 1
        }
        assert.end()
    })

    scenario.afterEach("web", function (context, assert) {
        context.count -= 1
        assert.end()
    })

    scenario.after("web", function (context, assert) {
        assert.equal(context.setup, "The tag worked")
        assert.equal(context.count, 0)
        assert.end()
    })
}