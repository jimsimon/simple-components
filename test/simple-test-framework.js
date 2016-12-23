function createSimpleReporter(karma) {

    var isDebugPage = /debug.html$/.test(window.location.pathname)


    /**
     *  These are all the events you can subscribe to:
     *   - `start`  execution started
     *   - `end`  execution complete
     *   - `suite`  (suite) test suite execution started
     *   - `suite end`  (suite) all tests (and sub-suites) have finished
     *   - `test`  (test) test execution started
     *   - `test end`  (test) test completed
     *   - `hook`  (hook) hook execution started
     *   - `hook end`  (hook) hook complete
     *   - `pass`  (test) test passed
     *   - `fail`  (test, err) test failed
     */
    return function (runner) {

        runner.on('end', function () {
            window.parent.runNextTest();
        });

        runner.on('test', function (test) {
            test.$startTime = Date.now()
            test.$errors = []
            test.$assertionErrors = []
        })

        runner.on('fail', function (test, error) {
            var simpleError = formatError(error)
            var assertionError = processAssertionError(error)

            if (test.type === 'hook') {
                test.$errors = isDebugPage ? [error] : [simpleError]
                test.$assertionErrors = assertionError ? [assertionError] : []
                runner.emit('test end', test)
            } else {
                test.$errors.push(isDebugPage ? error : simpleError)
                if (assertionError) test.$assertionErrors.push(assertionError)
            }
        })

        runner.on('test end', function (test) {
            var skipped = test.pending === true;

            var result = {
                id: '',
                description: test.title,
                suite: [],
                success: test.state === 'passed',
                skipped: skipped,
                time: skipped ? 0 : test.duration,
                log: test.$errors || [],
                assertionErrors: test.$assertionErrors || [],
                startTime: test.$startTime,
                endTime: Date.now()
            };

            var pointer = test.parent;
            while (!pointer.root) {
                result.suite.unshift(pointer.title);
                pointer = pointer.parent
            }

            karma.result(result);
        });
    }
}

var processAssertionError = function (error_) {
    var error

    if (window.Mocha && error_.hasOwnProperty('showDiff')) {
        error = {
            name: error_.name,
            message: error_.message,
            showDiff: error_.showDiff
        }

        if (error.showDiff) {
            error.actual = window.Mocha.utils.stringify(error_.actual)
            error.expected = window.Mocha.utils.stringify(error_.expected)
        }
    }

    return error
}

function simpleTestFile(mochaOptions, callback) {

    var mochaRequiredSettings = {
        reporter: createSimpleReporter(window.parent.__karma__)
    };

    var mochaConfig = Object.assign(mochaOptions, mochaRequiredSettings);

    mocha.setup(mochaConfig);

    callback();

    mocha.checkLeaks();
    mocha.run();
}

var formatError = function (error) {
    var stack = error.stack
    var message = error.message

    if (stack) {
        if (message && !includes(stack, message)) {
            stack = message + '\n' + stack
        }

        // remove mocha stack entries
        return stack.replace(/\n.+\/mocha\/mocha\.js\?\w*:[\d:]+\)?(?=(\n|$))/g, '')
    }

    return message
};

// backwards compatible version of (Array|String).prototype.includes
var includes = function (collection, element, startIndex) {
    if (!collection || !collection.length) {
        return false
    }

    // strings support indexOf already
    if (typeof collection === 'string') {
        return collection.indexOf(element, startIndex) !== -1
    }

    if (Array.prototype.indexOf) {
        return collection.indexOf(element, startIndex) !== -1
    }

    for (var i = startIndex || 0, len = collection.length; i < len; i++) {
        if (collection[i] === element) {
            return true
        }
    }
}