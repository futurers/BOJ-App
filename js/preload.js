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
     
    function deleteCookie(cookieName){
        var temp=getCookie(cookieName);
        if(temp){
            setCookie(cookieName,temp,(new Date(1)));
        }
    }
    const element2 = document.getElementsByClassName('loginbar pull-right')[0];
    element2.innerHTML += '<li class="topbar-devider"></li> \
    <li> \
    <a id="adblock-tg" href="javascript:void(0)">광고차단</a> \
    </li>';

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