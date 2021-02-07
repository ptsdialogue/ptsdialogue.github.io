var botui = new BotUI('bot');

function init() {

    var protocol;
    $.getJSON("../protocol/phq.json", function (data) {
        console.log(data);
        protocol = data;
    });

    botui.message.bot({
        delay: 700,
        content: 'Welcome to SanjBot. The current survey protocol is modeled after the PHQ-9'
    }).then(function () {
        botui.message.bot({
            delay: 500,
            content: 'Would you prefer to type your answer or select from multiple choice?'
        }).then(function () {
            botui.action.button({
                delay: 1000,
                action: [{
                    text: "Type",
                    value: "text"
                }, {
                    text: "Select",
                    value: "button"
                }]
            }).then(function (res) {
                if (res.value == 'text') {
                    surveyText(protocol, 0);
                } else if (res.value == 'button') {
                    survey(protocol, 0);
                }
            });
        })
    });
}

function parseObj(obj) {
    var question = Object.keys(obj)[0];
    var options = obj[question];

    var formatted_opt = [];
    for (var j = 0; j < options.length; j++) {
        var cell = {};
        cell.text = options[j];
        cell.value = options[j];
        formatted_opt.push(cell);
    }
    return {
        "question": question,
        "options": formatted_opt
    };
}

function survey(protocol, i) {
    if (i >= Object.keys(protocol).length) {
        done();
        return;
    }

    var curr = parseObj(protocol[i]);

    botui.message.bot({
            delay: 500,
            content: curr.question
        })
        .then(function () {
            return botui.action.button({
                delay: 1000,
                action: curr.options
            })
        })
        .then(function () {
            survey(protocol, i + 1);
        });
}

function surveyText(protocol, i) {
    if (i >= Object.keys(protocol).length) {
        done();
        return;
    }

    var curr = parseObj(protocol[i]);

    botui.message.bot({
            delay: 500,
            content: curr.question
        })
        .then(function () {
            return botui.action.text({ // show 'text' action
                action: {
                    placeholder: ''
                }
            });
        })
        .then(function () {
            surveyText(protocol, i + 1);
        });
}

function done() {

    botui.message.bot({
        delay: 700,
        content: 'Your response has been recorded'
    }).then(function () {
        return botui.message.bot({
            delay: 700,
            content: "Thank you"
        })
    });
}

init();