var botui = new BotUI('bot');

var fixed_delay = 500; // TODO: adjust delay?
var protocol;

function loadMessage(protocol, i) { // recursive message display function

    
    if (i >= Object.keys(protocol).length) { return; } // end recursion

    var curr = protocol[i];
    
    if (curr.message == "CLEAR") { // clear chat
        $('.botui-messages-container').children().fadeOut(500)
            .promise().then(function(){
                $('.botui-messages-container').empty();
                loadMessage(protocol, i + 1);
            });
    } else { // standard dialogue
        botui.message.bot({
            delay: Math.max(curr.message.length * 10, 500),
            loading: true,
            content: curr.message
        })
        .then(function () {
            $(".botui-messages-container").stop().animate({ scrollTop: $(".botui-messages-container")[0].scrollHeight}, 500); // autoscroll bottom
            if (curr.options) { // text-entry question
                if (curr.options.length == 0) { 
                    return botui.action.text({
                        delay: fixed_delay,
                        action: {
                            placeholder: ''
                        }
                    }).then(function (res) { // TODO: handle user input
                        // console.log(res.value);
                        loadMessage(protocol, i + 1);
                    });
                } else { // multiple-choice question
                    var options = formatOptions(curr.options);
                    return botui.action.button({ 
                        delay: fixed_delay,
                        action: options
                    }).then(function (res) {
                        if (curr.dialogue) { // if redirect needed
                            var res_index = curr.options.indexOf(res.value);
                            var json_script = curr.dialogue[res_index];
                            $.getJSON("scripts/"+json_script,loadDialogue);
                        } else { // continue
                            loadMessage(protocol, i + 1);
                        }
                    });
                }
            }
            loadMessage(protocol, i + 1);
        });
    }


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

function loadDialogue(data) {
    console.log(data);
    protocol = data;
    loadMessage(protocol,0);
}

$.getJSON("scripts/init.json",loadDialogue);