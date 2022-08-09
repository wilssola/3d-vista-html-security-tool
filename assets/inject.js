document.addEventListener('DOMContentLoaded', injectOnLoad);

function injectOnLoad() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'auth.txt', true);
    xhr.onload = () => {
        const fileExists = xhr.status === 200;
        const authorized = xhr.responseText.length === 0;

        console.log(xhr.responseText);

        if(!fileExists && !authorized) { 
            window.location.href = 'notfound.html';
            return;
        }

        onLoad();
    }
    xhr.send();
}