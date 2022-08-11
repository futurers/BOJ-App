    while(document.getElementsByClassName('adsbygoogle')[0] != null)
    {
        element = document.getElementsByClassName('adsbygoogle')
        var i = 0
        for(i; i < element.length; i++)
        {
            element[i].remove();
        }
    }
