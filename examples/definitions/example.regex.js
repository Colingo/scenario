module.exports = function (scenario) {
    scenario("As a different user I want to do things", [
        "I am a different user",
        "I want to do different things",
        "I do the different thing",
        "something different happens"
    ])

    scenario.define(/^I am a different user$/, function (context, assert) {
        context.user = "Matt"
        assert.end()
    })

    scenario.define(/^I want to do different things$/, function (context, assert) {
        context.thing = 1
        context.doThing = function () {
            context.thing += 1
        }
        assert.end()
    })

    scenario.define(/^I do the different thing$/, function (context, assert) {
        context.doThing()
        assert.end()
    })

    scenario.define(/^something different happens$/, function (context, assert) {
        assert.equal(context.thing, 2, "The thing happened")
        assert.end()
    })
}

module.exports.tags = ["web"]