module.exports = function (scenario) {
    scenario("As a user I want to do things", [
        "Given that I am a user",
        "And I want to do things",
        "When I do the thing",
        "Something happens"
    ])

    scenario.define("Given that I am a user", function (context, assert) {
        context.user = "Matt"
        assert.end()
    })

    scenario.define("And I want to do things", function (context, assert) {
        context.thing = 1
        context.doThing = function () {
            context.thing += 1
        }
        assert.end()
    })

    scenario.define("When I do the thing", function (context, assert) {
        context.doThing()
        assert.end()
    })

    scenario.define("Something happens", function (context, assert) {
        assert.equal(context.thing, 2, "The thing happened")
        assert.end()
    })
}