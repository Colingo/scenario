module.exports = function (scenario) {
    scenario("As a user I want to do things", [
        "I am a user",
        "I want to do things",
        "I do the thing",
        "something happens"
    ])

    scenario.define(/^I am a user$/, function (context, assert) {
        context.user = "Matt"
        assert.end()
    })

    scenario.define(/^I want to do things$/, function (context, assert) {
        context.thing = 1
        context.doThing = function () {
            context.thing += 1
        }
        assert.end()
    })

    scenario.define(/^I do the thing$/, function (context, assert) {
        context.doThing()
        assert.end()
    })

    scenario.define(/^something happens$/, function (context, assert) {
        assert.equal(context.thing, 2, "The thing happened")
        assert.end()
    })
}