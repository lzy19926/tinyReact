

function lzyLoader(source) {

    const newSource = source.replace('<TEMPLATE>', '`<div>')
        .replace('</TEMPLATE>', '</div>`')

    return `${newSource}`
}



module.exports = lzyLoader