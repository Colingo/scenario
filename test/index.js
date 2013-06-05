var test = require("tape")

var scenario = require("../index")

test("scenario is a function", function (assert) {
    assert.equal(typeof scenario, "function")
    assert.end()
})
