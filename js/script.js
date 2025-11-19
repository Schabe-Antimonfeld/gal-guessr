const url = 'https://api.vndb.org/kana/'

async function getStats() {
    try {
        const response = await fetch(url + 'stats')
        const stats = await response.json()
        console.log('[INFO] Total characters:', stats.chars)
        console.log('[INFO] Total producers:', stats.producers)
        console.log('[INFO] Total releases:', stats.releases)
        console.log('[INFO] Total staff:', stats.staff)
        console.log('[INFO] Total tags:', stats.tags)
        console.log('[INFO] Total traits:', stats.traits)
        console.log('[INFO] Total visual novels:', stats.vn)
        return stats
    } catch (err) {
        console.error(err)
        return null
    }
}

async function getVN(difficulty = 'normal') {
    try {
        let vn = []
        let page = 1
        let finished = false
        let filters = []
        switch (difficulty) {
            case 'easy':
                // 仅柚子社作品
                // Ciallo～(∠・ω< )⌒★
                // 柚子厨蒸鹅心是说
                filters = [
                    'and',
                    ['developer', '=', ['id', '=', 'p98']],
                    ['released', '>=', '2015-01-31']
                ]   
                break
            case 'normal':
                // vndb 评分数>=2000 评分>=7.0
                filters =[
                    'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 2000],
                    ['rating', '>=', 70],
                    ['release', '=', [
                        'and', 
                        ['lang', '=', 'zh-Hans'],
                        ['or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],    // RPG
                    ['tag', '!=', 'g33'],    // Strategy Game
                    ['tag', '!=', 'g350']    // Interactive Adventure Game
                ]
                break
            case 'hard':
                // vndb 评分数>=1000 评分>=6.5
                filters = [
                    'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 1000],
                    ['rating', '>=', 65],
                    ['release', '=', [
                        'and',
                        ['lang', '=', 'zh-Hans'],
                        ['or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],    // RPG
                    ['tag', '!=', 'g33'],    // Strategy Game
                    ['tag', '!=', 'g350']    // Interactive Adventure Game
                ]
                break
            case 'insane':
            // vndb 评分数>=500 评分>=6.0
                filters = [
                    'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 500],
                    ['rating', '>=', 60],
                    ['release', '=', [
                        'and',
                        ['lang', '=', 'zh-Hans'],
                        ['or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],    // RPG
                    ['tag', '!=', 'g33'],    // Strategy Game
                    ['tag', '!=', 'g350']    // Interactive Adventure Game
                ]
                break
            default:
                throw new Error(`[ERROR] Unknown difficulty level: ${difficulty}`)
        }
        while (!finished) {
            const response = await fetch(url + 'vn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filters: filters,
                    fields: 'id,titles{title,lang},rating,votecount',
                    sort: 'votecount',
                    reverse: true,
                    results: 100,
                    page: page
                })
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`[${response.status}] ${text}`)
            }

            const data = await response.json()

            if (!data.results || data.results.length === 0) {
                finished = true
            } else {
                vn = vn.concat(data.results)
                console.log(`[INFO] PAGE ${page} fetched ${data.results.length}`)
                page++
            }
        }

        console.log('[INFO] Total visual novels fetched:', vn.length)
        console.log(vn.slice(0, 10))
        return vn

    } catch (err) {
        console.error('[ERROR]', err)
        return null
    }
}

async function getRandChar(vn) {
    try {
        const response = await fetch(url + 'character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filters:
                    ['and',
                    ['gender', '=', 'f'],
                    ['or',
                        ['role', '=', 'main'],
                        ['role', '=', 'primary']
                    ],
                    ['vn', '=', ['id', '=', vn]]
                ],
                fields: 'name,original,image.url,traits{id,name,group_name,spoiler},vns.titles{title,lang}',
                results: 100
            })
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`[${response.status}] ${text}`)
        }

        const data = await response.json()
        const char = data.results[Math.floor(Math.random() * data.results.length)]
        console.log('[INFO] Random character fetched:', char)
        return char

    } catch (err) {
        console.error('[ERROR]', err)
        return null
    }
}

async function searchChar(name, page = 1) {
    try {
        const response = await fetch(url + 'character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filters: [
                    'and',
                    ['search', '=', name],
                    ['vn', '=', [
                        'and',
                        ['olang', '=', 'ja'],
                        ['votecount', '>=', 500],
                        ['rating', '>=', 60],
                        ['release', '=', [
                            'and',
                            ['lang', '=', 'zh-Hans'],
                            ['or',
                            ['minage', '>=', 18],
                            ['producer', '=', [
                                'or',
                                ['id', '=', 'p24'],    // Key
                                ['id', '=', 'p146'],   // MAGES
                                ['id', '=', 'p82'],    // 07th Expansion
                                ['id', '=', 'p11'],    // Stage-nana
                                ['id', '=', 'p3354'],  // NOVECT
                                ['id', '=', 'p336']    // Frontwing
                            ]]]
                        ]],
                        ['tag', '!=', 'g35'],    // RPG
                        ['tag', '!=', 'g33'],    // Strategy Game
                        ['tag', '!=', 'g350']    // Interactive Adventure Game
                    ]],
                    ['gender', '=', 'f'],
                    ['or',
                    ['role', '=', 'main'],
                    ['role', '=', 'primary']],
                ],
                fields: 'name,original,image.url,traits{id,name,group_name,spoiler},vns.titles{title,lang}',
                sort: 'searchrank',
                page: page,
                results: 100
            })
        })
        if (!response.ok) {
            const text = await response.text()
            throw new Error(`[${response.status}] ${text}`)
        }
        const data = await response.json()
        console.log(`[INFO] Search results for "${name}":`, data.results)
        return data.results
    } catch (err) {
        console.error('[ERROR]', err)
        return null
    }
}

function getVNTitle(char) {
    let originalTitle = ''
    let titles = char.vns[0].titles
    for (const titleObj of titles) {
        if (titleObj.lang === 'zh-Hans') {
            return titleObj.title
        }
        if (titleObj.lang === 'ja') {
            originalTitle = titleObj.title
        }
    }
    return originalTitle
}

function showDropdown(results) {
    const dropdown = document.getElementById('dropdown')
    dropdown.innerHTML = ''

    if (results.length === 0) {
        dropdown.style.display = 'none'
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

async function onSearchInput(value) {
    if (!value.trim()) {
        document.getElementById('dropdown').style.display = 'none'
        return
    }
    showDropdown(['检索VNDB中...'])
    let results = await searchChar(value)
    showDropdown(results)
}

function selectCharacter(char) {
    document.getElementById('searchInput').value = char.original
    document.getElementById('dropdown').style.display = 'none'
    checkGuess(char)
}

function checkGuess(char) {
    if (char.original === target.original) {
        handleEnd()
    } else {
        result.innerHTML = 
            `
            <div class="card mt-5 text-center " style="width: 22rem;">
                <h3 class="card-header" style="background-color: red;"></h3>
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${char.image ? char.image.url : ''}" alt="" height="150" width="128">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body text-wrap">
                            <h5 class="card-title">${(char.original ? char.original : char.name)}</h5>
                            <p class="card-text" style="font-size: smaller; color: gray;">${(char.vns && char.vns.length > 0 ? ` ${getVNTitle(char)}` : '')}</p>
                        </div>
                    </div>
                </div>
            </div>
            `
        const commonTraits = compareTraits(target, char)
        addCommonTraits(commonTraits)
        renderTraits(traits)
    }
}

function compareTraits(target, char) {
    const traits1 = target.traits
    const traits2 = char.traits
    const commonTraits = traits1.filter(t1 => traits2.some(t2 => t2.id === t1.id))
    return commonTraits
}

let traits = {
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

function addCommonTraits(commonTraits) {
    commonTraits.forEach(trait => {
        if (!traits[trait.group_name].some(t => t.id === trait.id)) {
            traits[trait.group_name].push(trait)
        }
    })
}

let dict = null
fetch('./lang.json').then(response => response.json()).then(data => dict = data)

function renderTraits(traits) {
    console.log('[INFO] Current common traits:', traits)
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

    tHair.innerHTML = '<a href="https://vndb.org/i1" class="btn btn-primary" target="_blank">毛发</a>: ' + traits['Hair'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tEyes.innerHTML = '<a href="https://vndb.org/i35" class="btn btn-primary" target="_blank">眼睛</a>: ' + traits['Eyes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tBody.innerHTML = '<a href="https://vndb.org/i36" class="btn btn-primary" target="_blank">身体</a>: ' + traits['Body'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tClothes.innerHTML = '<a href="https://vndb.org/i37" class="btn btn-primary" target="_blank">服装</a>: ' + traits['Clothes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tItems.innerHTML = '<a href="https://vndb.org/i38" class="btn btn-primary" target="_blank">物品</a>: ' + traits['Items'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tPersonality.innerHTML = '<a href="https://vndb.org/i39" class="btn btn-primary" target="_blank">性格</a>: ' + traits['Personality'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tRole.innerHTML = '<a href="https://vndb.org/i40" class="btn btn-primary" target="_blank">角色</a>: ' + traits['Role'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tEngagesIn.innerHTML = '<a href="https://vndb.org/i41" class="btn btn-primary" target="_blank">主动</a>: ' + traits['Engages in'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
    tSubjectOf.innerHTML = '<a href="https://vndb.org/i42" class="btn btn-primary" target="_blank">被动</a>: ' + traits['Subject of'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-${spoiler[t.spoiler]}" target="_blank">${dict[t.name]}</a>`).join(' ')
}

getStats()

window.onSearchInput = onSearchInput

const startBtn = document.getElementById('startBtn')
const result = document.getElementById('result')

let target = null
let gameStarted = false

async function handleStart() {
    gameStarted = true
    startBtn.innerHTML =
        `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">加载中</span>`

    const difficulty = document.querySelector('.selector-option.active').id
    const options = document.querySelectorAll('.selector-option')

    options.forEach(opt => opt.disabled = true)

    const vns = await getVN(difficulty)
    const vn = vns[Math.floor(Math.random() * vns.length)]
    target = await getRandChar(vn.id)

    document.getElementById('selector').classList.add('disabled')
    document.querySelector('.search-container').classList.remove('disabled')

    startBtn.innerText = '猜不出来'
}

function handleEnd() {
    if (!gameStarted) return

    document.getElementById('dropdown').style.display = 'none'
    document.querySelector('.search-container').classList.add('disabled')

    startBtn.innerText = '再来一次'
    result.innerHTML = 
        `
        <div class="card mt-5 text-center " style="width: 22rem;">
            <h3 class="card-header" style="background-color: green;"></h3>
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${target.image ? target.image.url : ''}" alt="" height="150" width="128">
                </div>
                <div class="col-md-8">
                    <div class="card-body text-wrap">
                        <h5 class="card-title">${(target.original ? target.original : target.name)}</h5>
                        <p class="card-text" style="font-size: smaller; color: gray;">${(target.vns && target.vns.length > 0 ? ` ${getVNTitle(target)}` : '')}</p>
                    </div>
                </div>
            </div>
        </div>
        `

    gameStarted = false
}

function handleRestart() {
    window.location.reload()
}

startBtn.addEventListener('click', function () {
    if (!target) {
        handleStart()
    } else if (gameStarted) {
        handleEnd()
    } else {
        handleRestart()
    }
})