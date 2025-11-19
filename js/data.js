export let traits = {
    'Hair': [],
    'Eyes': [],
    'Body': [],
    'Clothes': [],
    'Items': [],
    'Personality': [],
    'Role': [],
    'Engages in': [],
    'Subject of': [],
    'Engages in (Sexual)': [],
    'Subject of (Sexual)': []
}

export let dict = null

export function loadDict() {
    return fetch('./lang.json').then(response => response.json()).then(data => {
        dict = data
        return data
    }).catch(err => {
        console.error('[ERROR] loadDict', err)
        return null
    })
}
