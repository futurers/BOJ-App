const pako = require('pako');
var fieldSeparator = "\xff";
var startOfExtraFields = "\xfe";

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
    function setCookie(cookieName, cookieValue, cookieExpire, cookiePath, cookieDomain, cookieSecure){
        var cookieText=escape(cookieName)+'='+escape(cookieValue);
        cookieText+=(cookieExpire ? '; EXPIRES='+cookieExpire.toGMTString() : '');
        cookieText+=(cookiePath ? '; PATH='+cookiePath : '');
        cookieText+=(cookieDomain ? '; DOMAIN='+cookieDomain : '');
        cookieText+=(cookieSecure ? '; SECURE' : '');
        document.cookie=cookieText;
    }
     
    function getCookie(cookieName){
        var cookieValue=null;
        if(document.cookie){
            var array=document.cookie.split((escape(cookieName)+'='));
            if(array.length >= 2){
                var arraySub=array[1].split(';');
                cookieValue=unescape(arraySub[0]);
            }
        }
        return cookieValue;
    }
     
    function getElementByXpath(path) 
    {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function deleteCookie(cookieName){
        var temp=getCookie(cookieName);
        if(temp){
            setCookie(cookieName,temp,(new Date(1)));
        }
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
    </li>';
    if(isLoggedin)
    {
        const element3 = getElementByXpath("/html/body/div[2]/div[1]/div[1]/div/ul/li[1]");
        element3.innerHTML += `
        <img src="${get_tier(getElementByXpath('/html/body/div[2]/div[1]/div[1]/div/ul/li[1]/a').innerText)}" style="height: 15px; width: 15px;"/>`;
    }
    if(getCookie('adblock-activated') == "true")
    {
        document.getElementById('adblock-tg').innerText= "광고차단 해제";
        adblock();
    }
    else
    {
        document.getElementById('adblock-tg').innerText= "광고차단";
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
        console.log('a')
        setCookie('adblock-activated', (element5.innerText == "광고차단").toString())
        element5.innerText = (element5.innerText == "광고차단")?"광고차단 해제":"광고차단"
        adblock();
    });
});
window.onload = function()
{
    function getElementByXpath(path) 
    {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    if(getElementByXpath("/html/body/div[2]/div[2]/div/div[1]/ul[2]/li[1]") != undefined)
    {
        getElementByXpath("/html/body/div[2]/div[2]/div/div[1]/ul[2]/li[1]").remove();
    }
    if(document.URL.startsWith("https://www.acmicpc.net/"))
    {
    }
    else
    {
        window.open(document.URL, "_blank");
        history.back();
    }
    if(document.URL.startsWith("https://www.acmicpc.net/submit/"))
    {
        document.getElementsByClassName("col-md-offset-2 col-md-10")[0].innerHTML += '                                                                                    <input type="text" class="btn" id="check_field"><button id="check_button" type="button" class="btn btn-primary" data-loading-text="확인 중...">확인</button>';
        if(document.getElementsByClassName("chosen-single")[0].innerText == "C++17")
        {
            var target = document.getElementById("check_button");
            target.addEventListener("click", function() {
                line = document.getElementsByClassName("CodeMirror-line")
                var code = "";
                for(var i = 0;i < line.length;i++)
                {
                    code += line[i].innerText + "\n";
                }
                TIO.run(code, document.getElementById("check_field").value, "cpp-gcc").then(n=>alert(n[0] + "\n" + n[1]));
            })
        } 
    }
}