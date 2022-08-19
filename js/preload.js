const Notify = require('simple-notify');
const pako = require('pako');
const beautify = require('beautify');
const fs = require('fs');
const { chrome } = require('process');
const { ipcRenderer } = require('electron');
const { syncBuiltinESMExports } = require('module');

var fieldSeparator = "\xff";
var startOfExtraFields = "\xfe";

var data =fs.readFileSync(__dirname + '/lang.json', 'utf8');
const lang_json = JSON.parse(data);
 	
function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

function deflate(arr) {
    return pako.deflateRaw(arr, {
        "level": 9
    });
}

function inflate(arr) {
    return pako.inflateRaw(arr);
}

function encode(str) {
    var bytes = new TextEncoder("utf-8").encode(str);
    return deflate(bytes);
}

function arrToB64(arr) {
    var bytestr = "";
    arr.forEach(c => bytestr += String.fromCharCode(c));
    return btoa(bytestr).replace(/\+/g, "@").replace(/=+/, "");
}

function b64ToArr(str) {
    return new Uint8Array([...atob(decodeURIComponent(str).replace(/@/g, "+"))].map(c => c.charCodeAt()))
}

function byteStringToByteArray(byteString) {
    var byteArray = new Uint8Array(byteString.length);
    for(var i = 0; i < byteString.length; i++)
        byteArray[i] = byteString.charCodeAt(i);
    byteArray.head = 0;
    return byteArray;
}

function textToByteString(string) {
    return window.unescape(window.encodeURIComponent(string));
}

function byteStringToText(string){
    return window.decodeURIComponent(window.escape(string));
}

function byteArrayToByteString(byteArray) {
    var retval = "";
    byteArray.forEach(function(byte) {
        retval += String.fromCharCode(byte);
    });
    return retval;
}

function byteStringToBase64(byteString) {
    return window.btoa(byteString).replace(/\+/g, "@").replace(/=+/, "");
}

var fieldSeparator = "\xff";
var startOfExtraFields = "\xfe";

var TIO = {


    run:
    async function run(code, input, lang) {
        const encoder = new TextEncoder("utf-8");
        var length = encoder.encode(code).length;
        var iLength = encoder.encode(input).length;
        //  Vlang\u00001\u0000{language}\u0000F.code.tio\u0000{# of bytes in code}\u0000{code}F.input.tio\u0000{length of input}\u0000{input}Vargs\u0000{number of ARGV}{ARGV}\u0000R
        var rBody = "Vlang\x001\x00" + lang + "\x00F.code.tio\x00" + length + "\x00" + code + "F.input.tio\x00" + iLength + "\x00" + input + "Vargs\x000\x00R";
        rBody = encode(rBody);
        var fetched = await fetch("https://tio.run/cgi-bin/run/api/", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: rBody
        });
        var read = (await fetched.body.getReader().read()).value;
        var text = new TextDecoder('utf-8').decode(read);
        return text.slice(16).split(text.slice(0, 16));
    },


    makeLink:
    function makeLink(languageId, header = "", code = "", footer = "", input = "", args = [], options = [], fullLink = true) {

        var stateString = languageId;

        var saveTextArea = function(textArea) {
            stateString += fieldSeparator + textToByteString(textArea);
        };

        [header, code, footer, input, ...args].forEach(saveTextArea);

        if (options.length) {
            stateString += startOfExtraFields + "options";

            options.forEach(saveTextArea);
        }
        // TODO: This default arg isn't working for some reason
        return (fullLink? "https://tio.run/##": "") +
            //byteStringToBase64(byteArrayToByteString(deflate(byteStringToByteArray(stateString))));
            arrToB64(deflate(byteStringToByteArray(stateString)));
    },


    parseLink:
    function parseLink(link) {
        if  (link.slice(0,18) === "https://tio.run/##") {
            link = link.slice(18);
        }

        var stateString = byteArrayToByteString(inflate(b64ToArr(link)));

        var fields = stateString.split(startOfExtraFields);
        var fields = fields.map(n=>n.split(fieldSeparator));

        var [languageId, header, code, footer, input, ...args] = fields[0];
        [header, code, footer, input, ...args] = [header, code, footer, input, ...args].map(n=>byteStringToText(n));
        var options = [];

        if (fields.length > 1) {
            options = fields[1].slice(1);
        }

        return {
            "languageId": languageId,
            "header": header,
            "code": code,
            "footer": footer,
            "input": input,
            "args": args,
            "options": options
        }
    },


};

window.addEventListener('DOMContentLoaded', (event) => {
    if(document.URL.startsWith("file://"))
    {
        return 0;;
    }
     
    function getElementByXpath(path) 
    {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    
    function get_tier(name)
    {
        const ajax = new XMLHttpRequest(); 
        const URL = "https://solved.ac/api/v3/search/user?query=" + name; 

        ajax.open("GET", URL, false); //true: 비동기적으로 가져온다 false: 동기적으로 수행한다
        ajax.send();

        const source = JSON.parse(ajax.response); // 객체 -> json으로 변환
        tier = source.items[0].tier
        return "https://static.solved.ac/tier_small/"+tier+".svg"
    }
    

    let isLoggedin = false
    if(getElementByXpath("/html/body/div[2]/div[1]/div[1]/div/ul/li[3]/a").getAttribute("href") == "/modify")
    {
        isLoggedin = true;
    }
    else
    {
        isloggedin = false;
    }
    const element2 = document.getElementsByClassName('loginbar pull-right')[0];
    element2.innerHTML += '<li class="topbar-devider"></li> \
    <li> \
    <a id="adblock-tg" href="javascript:void(0)">광고차단</a> \
    </li> \
    <li class="topbar-devider"></li> \
    <li> \
    <a id="boj-extended-tg" href="javascript:void(0)">BOJ EXTENDED ON</a> \
    </li> \
    <li class="topbar-devider"></li> \
    <li> \
    <a id="localStorage_clear" onclick="localStorage.clear();">로컬 스토리지 비우기</a> \
    </li>';
    
    if(isLoggedin)
    {
        const element3 = getElementByXpath("/html/body/div[2]/div[1]/div[1]/div/ul/li[1]");
        element3.innerHTML += `
        <img src="${get_tier(getElementByXpath('/html/body/div[2]/div[1]/div[1]/div/ul/li[1]/a').innerText)}" style="height: 15px; width: 15px;"/>`;
    }
    if(localStorage.getItem('adblock-activated') == "true")
    {
        document.getElementById('adblock-tg').innerText= "광고차단 해제";
        adblock();
    }
    else
    {
        document.getElementById('adblock-tg').innerText= "광고차단";
    }

    if(localStorage.getItem('boj-extended-activated') == "true")
    {
        document.getElementById('boj-extended-tg').innerText = "BOJ EXTENDED ON";
        be_fnc();
        document.getElementById('boj-extended-tg').innerText = "BOJ EXTENDED OFF";
    }
    else
    {
        document.getElementById('boj-extended-tg').innerText = "BOJ EXTENDED OFF";
        be_fnc();
        document.getElementById('boj-extended-tg').innerText= "BOJ EXTENDED ON";
    }

    function be_fnc()
    {
        if(document.getElementById('boj-extended-tg').innerText == "BOJ EXTENDED ON")
        {
            console.log('be_off');
            ipcRenderer.send('be_off');
        }
        else
        {
            console.log('be_on');
            ipcRenderer.send('be_on');
        }
    } 

    function be_off()
    {
        console.log('be_off');
        ipcRenderer.send('be_off');
    } 
    function be_on()
    {
        console.log('be_on');
        ipcRenderer.send('be_on');
    }


    function adblock()
    {
        if(document.getElementsByClassName('adsbygoogle')[0] != undefined)
        {
            if(document.getElementsByClassName('adsbygoogle')[0].style.display != "none")
            {
                let element = document.getElementsByClassName('adsbygoogle');
                var i = 0;
                for(i; i < element.length; i++)
                {
                    element[i].style.display = 'none';
                }
            }
            else
            {
                element = document.getElementsByClassName('adsbygoogle');
                var i = 0;
                for(i; i < element.length; i++)
                {
                    element[i].style.display = 'block';
                }
            }
        }
    }

    if(document.URL.includes("/setting") || document.URL.includes("/modify") || document.URL.includes("/password"))
    {
        document.getElementsByClassName("list-group-item")[0].addEventListener("click", () => {
            chrome.extension.getURL("options/option.html");
        });
    }
    const element4 = document.head;
    element4.innerHTML += '<script> \
    function adblock() \
    { \
        while(document.getElementsByClassName(\'adsbygoogle\')[0] != null) \
        { \
            element = document.getElementsByClassName(\'adsbygoogle\'); \
            var i = 0; \
            for(i; i < element.length; i++) \
            { \
                element[i].remove(); \
            } \
        } \
    } \
    </script>';
    const element5 = document.getElementById('adblock-tg');
    element5.addEventListener('click', (event) => {
        localStorage.setItem('adblock-activated', (element5.innerText == "광고차단").toString());
        element5.innerText = (element5.innerText == "광고차단")?"광고차단 해제":"광고차단";
        adblock();
    });
    const element6 = document.getElementById('boj-extended-tg');
    element6.addEventListener('click', (event) => {
        localStorage.setItem('boj-extended-activated', (element6.innerText == "BOJ EXTENDED ON").toString());
        element6.innerText = (element6.innerText == "BOJ EXTENDED ON")?"BOJ EXTENDED OFF":"BOJ EXTENDED ON";
        be_fnc();
        location.reload();
    });
    
});

window.onload = () => 
{
    if(document.URL.startsWith("file://"))
    {
        return 0;;
    }
    document.head.innerHTML += `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simple-notify@0.5.5/dist/simple-notify.min.css" /> \
    <script src="https://cdn.jsdelivr.net/npm/simple-notify@0.5.5/dist/simple-notify.min.js"></script>;`
    function getElementByXpath(path) 
    {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    if(!document.URL.startsWith("https://www.acmicpc.net/") && !document.URL.includes("BOJ-App/index.html"))
    {
        window.open(document.URL);
        history.back();
    }
    if(document.URL.startsWith("https://www.acmicpc.net/submit/"))
    {
        document.getElementsByClassName("col-md-offset-2 col-md-10")[0].innerHTML += '                                                                                    <input type="text" class="btn" id="check_field">       <button id="check_button" type="button" class="btn btn-primary" data-loading-text="확인 중...">확인</button>';
        document.getElementById("check_field").style.border = "1px solid black";
        document.getElementById("check_button").addEventListener("click", (event) => {
            if(lang_json.hasOwnProperty(document.getElementsByClassName("chosen-single")[0].innerText))
            {
                if(lang_json[document.getElementsByClassName("chosen-single")[0].innerText] == "unsupported")
                {
                    new Notify({ status: 'error', title: '실행 결과:', text: `<b>지원되지 않는 언어입니다</b>`, effect: 'fade', speed: 300, customClass: null, customIcon: "Boj", showIcon: true, showCloseButton: true, autoclose: true, autotimeout: 8000, gap: 20, distance: 20, type: 1, position: 'right top'})
                    return;
                }
                line = document.getElementsByClassName(" CodeMirror-line ");
                var code = "";            //*[@id="submit_form"]/div[3]/div/div/div[6]/div[1]/div/div/div/div[5]/div[3]/pre/span
                for(var i = 0;i < line.length;i++)
                {
                    code += line[i].innerText.replace(/[\u200B-\u200D\uFEFF]/g, '') + "\n";
                }
                TIO.run(beautify(code, {format: 'js'}), document.getElementById("check_field").value, lang_json[document.getElementsByClassName("chosen-single")[0].innerText]).then(n=>new Notify({ status: 'success', title: '실행 결과:', text: `<b><p style='font-size: 14px; color: black;'>stdout: ${n[0]} </p></b>
                stderr+timing: ${n[1]} `, effect: 'fade', speed: 300, customClass: null, customIcon: "Boj", showIcon: true, showCloseButton: true, autoclose: true, autotimeout: 8000, gap: 20, distance: 20, type: 1, position: 'right top'}));
            }
        })
    }

}
