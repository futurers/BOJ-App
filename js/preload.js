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
                element = document.getElementsByClassName('adsbygoogle');
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
    const element1 = document.head;
    element1.innerHTML += '<script> \
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
    const element3 = document.getElementById('adblock-tg');
    element3.addEventListener('click', (event) => {
        console.log('a')
        setCookie('adblock-activated', (element3.innerText == "광고차단").toString())
        element3.innerText = (element3.innerText == "광고차단")?"광고차단 해제":"광고차단"
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
}