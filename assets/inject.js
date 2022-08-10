document.addEventListener('DOMContentLoaded', injectOnLoad);

function injectOnLoad() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'REQUEST_URL', true);
    xhr.onload = () => {
        const fileExists = xhr.status === 200;
        if(!fileExists) 
            return blockLoad();
        
        const json = JSON.parse(xhr.responseText);
        if (!json.auth)
            return blockLoad();

        onLoad();
    }
    xhr.send();
        
    const interval = 30 * 1000;
    setInterval(() => injectOnLoad(), interval);
}

function blockLoad() { 
    return setTimeout(() => window.location.reload(), 1000);
}