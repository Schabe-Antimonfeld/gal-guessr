import { getVNTitle } from './helpers.js'
import { traits, dict } from './data.js'
import { searchChar } from './api.js'

export function showDropdown(results) {
    const dropdown = document.getElementById('dropdown')
    dropdown.innerHTML = ''

    if (!results || results.length === 0) {
        dropdown.style.display = 'none'
        return
    }

    if (typeof results[0] === 'string') {
        dropdown.innerHTML = `<div class="dropdown-item">${results[0]}</div>`
        dropdown.style.display = 'block'
        return
    }

    results.forEach(char => {
        const div = document.createElement('div')
        div.className = 'dropdown-item card'
        div.innerHTML =
        `<div class="row g-0">
            <div class="col-md-4">
                <img src="${char.image ? char.image.url : ''}" alt="" height="90" width="75">
            </div>
            <div class="col-md-8">
                <div class="card-body text-wrap">
                    <h5 class="card-title">${(char.original ? char.original : char.name)}</h5>
                    <p class="card-text" style="font-size: smaller; color: gray;">${(char.vns && char.vns.length > 0 ? ` ${getVNTitle(char)}` : '')}</p>
                </div>
            </div>
        </div>`
        div.onclick = () => selectCharacter(char)
        dropdown.appendChild(div)
    })

    dropdown.style.display = 'block'
}

export async function onSearchInput(value) {
    if (!value.trim()) {
        document.getElementById('dropdown').style.display = 'none'
        return
    }
    showDropdown(['检索VNDB中...'])
    let results = await searchChar(value)
    showDropdown(results)
}

export function selectCharacter(char) {
    document.getElementById('searchInput').value = char.original
    document.getElementById('dropdown').style.display = 'none'
    if (typeof window.checkGuess === 'function') {
        window.checkGuess(char)
    }
}

export function renderTraits(currentTraits) {
    console.log('[INFO] Current common traits:', currentTraits)
    const tHair = document.getElementById('tHair')
    const tEyes = document.getElementById('tEyes')
    const tBody = document.getElementById('tBody')
    const tClothes = document.getElementById('tClothes')
    const tItems = document.getElementById('tItems')
    const tPersonality = document.getElementById('tPersonality')
    const tRole = document.getElementById('tRole')
    const tEngagesIn = document.getElementById('tEngagesIn')
    const tSubjectOf = document.getElementById('tSubjectOf')

    let spoiler = ['primary', 'warning', 'danger']

    tHair.innerHTML = '<a href="https://vndb.org/i1" class="btn btn-primary" target="_blank">毛发</a>: ' + currentTraits['Hair'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tEyes.innerHTML = '<a href="https://vndb.org/i35" class="btn btn-primary" target="_blank">眼睛</a>: ' + currentTraits['Eyes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tBody.innerHTML = '<a href="https://vndb.org/i36" class="btn btn-primary" target="_blank">身体</a>: ' + currentTraits['Body'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tClothes.innerHTML = '<a href="https://vndb.org/i37" class="btn btn-primary" target="_blank">服装</a>: ' + currentTraits['Clothes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tItems.innerHTML = '<a href="https://vndb.org/i38" class="btn btn-primary" target="_blank">物品</a>: ' + currentTraits['Items'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tPersonality.innerHTML = '<a href="https://vndb.org/i39" class="btn btn-primary" target="_blank">性格</a>: ' + currentTraits['Personality'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tRole.innerHTML = '<a href="https://vndb.org/i40" class="btn btn-primary" target="_blank">角色</a>: ' + currentTraits['Role'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tEngagesIn.innerHTML = '<a href="https://vndb.org/i41" class="btn btn-primary" target="_blank">主动</a>: ' + currentTraits['Engages in'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
    tSubjectOf.innerHTML = '<a href="https://vndb.org/i42" class="btn btn-primary" target="_blank">被动</a>: ' + currentTraits['Subject of'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict ? dict[t.name] : t.name}</a>`).join(' ')
}

export function showToast(title, message, type='info') {
    const container = document.getElementById('toast-container')
            
    // 创建 toast 元素
    const toastId = 'toast-' + Date.now()
    const toastEl = document.createElement('div')
    toastEl.id = toastId
    toastEl.className = 'toast align-items-center text-white bg-' + type + ' border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive')
    toastEl.setAttribute('aria-atomic', 'true')
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong><br>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    container.appendChild(toastEl)
    
    // 初始化并显示 toast
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000  // 3秒后自动消失
    });
    
    toast.show();
    
    // toast 隐藏后从 DOM 中移除
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove()
    });
}