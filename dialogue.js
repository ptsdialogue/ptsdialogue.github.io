var base = window.location.pathname.split("/").length == 2 ? "./" : "../"

var botui = new BotUI('bot');
var fixed_delay = 700;
var protocol;

function updateUI(protocol, i) {
    var curr = protocol[i];
    botui.message.bot({
        delay: Math.max(curr.message.length * 10, fixed_delay),
        loading: true,
        content: curr.message
    })
    .then(function () {
        // autoscroll to bottom
        $(".botui-messages-container").stop().animate({ scrollTop: $(".botui-messages-container")[0].scrollHeight}, fixed_delay);
        if (curr.options) {
            var options = formatOptions(curr.options);
            return botui.action.button({
                delay: fixed_delay,
                action: options
            }).then(function (res) {
                if (curr.dialogue) { // load next dialogue
                    var res_index = curr.options.indexOf(res.value);
                    var json_script = curr.dialogue[res_index];
                    var filepath = base + 'scripts/' + persona + json_script;
                    console.log(filepath);
                    $.getJSON(filepath,loadDialogue);
                } else {
                    loadMessage(protocol, i + 1);
                }
            });
        } else {
            loadMessage(protocol, i + 1);
        }
    });
}

function loadDialogue(data) {
    protocol = data;
    loadMessage(protocol,0);
}

function loadMessage(protocol, i) { // recursive message display function
    if (i >= Object.keys(protocol).length) { return; } // end recursion
    if (protocol[i].message == "CLEAR") { clearChat(protocol, i); }
    else if (protocol[i].message == "PERSONA") { savePersona(protocol, i); }
    else { updateUI(protocol, i);}
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

function clearChat(protocol, i) {
    $('.botui-messages-container').children().fadeOut(500)
        .promise().then(function(){
            $('.botui-messages-container').empty(); 
            loadMessage(protocol, i + 1);
    });
}

var persona = '';
function savePersona(protocol, i) { // preliminary function for saving persona choice during session
    persona = protocol[i]["persona-choice"] + "/";
    loadMessage(protocol, i + 1);
}