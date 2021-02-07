var botui = new BotUI('bot');

var fixed_delay = 1000; // TODO: dynamically determine delay based on preceding text to allow users to read

function init() {
    var welcome;
    $.getJSON("./branches/welcome.json", function (data) { welcome = data;});
    
    botui.message.bot({
        delay: fixed_delay,
        loading: true,
        content: 'Welcome to PTSDialogue!'
    }).then(function (res) {
        loadDialogue(welcome, 0);
    });
}

// TODO: create copies of init() to reflect different dialogue paths

function loadDialogue(protocol, i) { // recursive dialogue display function

    if (i >= Object.keys(protocol).length) {
        done();
        return;
    }

    var curr = protocol[i];

    botui.message.bot({
        delay: curr.message.length * 18, // TODO: modify multiplier to adjust dialogue speed
        loading: true,
        content: curr.message
    })
    .then(function () {
        if (curr.options) { // TODO: add logic for text-entry questions
            if (curr.options.length == 0) { // text-entry question
                return botui.action.text({
                    delay: fixed_delay,
                    action: {
                        placeholder: ''
                    }
                }).then(function (res) { // TODO: handle user input
                    console.log(res.value);
                    loadDialogue(protocol, i + 1);
                });
            } else {
                var options = formatOptions(curr.options);
                return botui.action.button({ // multiple-choice question
                    delay: fixed_delay,
                    action: options
                }).then(function (res) { // TODO: handle branching paths based on user response (create function that uses curr as param?)
                    console.log(res.value);
                    loadDialogue(protocol, i + 1);
                });
            }
        }
        loadDialogue(protocol, i + 1);
    });
}

function formatOptions(options) {
    var formatted_opt = [];
    for (var j = 0; j < options.length; j++) {
        var cell = {};
        cell.text = options[j];
        cell.value = options[j];
        formatted_opt.push(cell);
    }
    return formatted_opt;
}

function done() {
    botui.message.bot({
        delay: fixed_delay,
        loading: true,
        content: "That's all for now folks! 🐷"
    });
}

init();