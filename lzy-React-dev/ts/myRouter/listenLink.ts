
function listenLink() {

    const linksArr = document.getElementsByTagName('fc-link')

    for (let i = 0; i < linksArr.length; i++) {
        const link = linksArr[i].childNodes
        console.log(link);
    }
}


export { listenLink }