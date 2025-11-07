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
                // 仅柚子社作品 截止2025.11.06共13部
                // Ciallo～(∠・ω< )⌒★
                // 柚子厨蒸鹅心是说
                filters = [
                    'and',
                    ['developer', '=', ['id', '=', 'p98']],
                    ['released', '>=', '2015-01-31']
                ]   
                break
            case 'normal':
                // vndb 评分数>=2000 评分>=7.0 截至2025.11.06共96部
                filters =[
                    'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 2000],
                    ['rating', '>=', 70],
                    ['release', '=', [
                        'or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]
                    ]],
                    ['tag', '!=', 'g35'],    // RPG
                    ['tag', '!=', 'g33'],    // Strategy Game
                    ['tag', '!=', 'g350']    // Interactive Adventure Game
                ]
                break
            case 'hard':
                // vndb 评分数>=1000 评分>=6.5 截至2025.11.06共377部
                filters = [
                    'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 1000],
                    ['rating', '>=', 65],
                    ['release', '=', [
                        'or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]
                    ]],
                    ['tag', '!=', 'g35'],    // RPG
                    ['tag', '!=', 'g33'],    // Strategy Game
                    ['tag', '!=', 'g350']    // Interactive Adventure Game
                ]
                break
            case 'insane':
            // vndb 评分数>=500 评分>=6.0 截至2025.11.06共1652部
                filters = [
                        'and',
                    ['olang', '=', 'ja'],
                    ['votecount', '>=', 500],
                    ['rating', '>=', 60],
                    ['release', '=', [
                        'or',
                        ['minage', '>=', 18],
                        ['producer', '=', [
                            'or',
                            ['id', '=', 'p24'],    // Key
                            ['id', '=', 'p146'],   // MAGES
                            ['id', '=', 'p82'],    // 07th Expansion
                            ['id', '=', 'p11'],    // Stage-nana
                            ['id', '=', 'p3354'],  // NOVECT
                            ['id', '=', 'p336']    // Frontwing
                        ]]
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
                fields: 'name,original,image.url,traits{id,name,group_name},vns.titles{title,lang}',
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

async function searchChar(name) {
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
                        ['tag', '!=', 'g35'],    // RPG
                        ['tag', '!=', 'g33'],    // Strategy Game
                        ['tag', '!=', 'g350']    // Interactive Adventure Game
                    ]],
                    ['gender', '=', 'f'],
                    ['or',
                    ['role', '=', 'main'],
                    ['role', '=', 'primary']],
                ],
                fields: 'name,original,image.url,traits{id,name,group_name},vns.titles{title,lang}',
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
        div.className = 'dropdown-item'
        div.textContent = char.original ? char.original : char.name
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
        result.textContent = `猜对了！是 ${char.original}！`
        result.style.color = 'green'
        handleEnd()
    } else {
        result.textContent = '猜错了。再试试吧！'
        result.style.color = 'red'
        const commonTraits = compareTraits(char, target)
        addCommonTraits(commonTraits)
        renderTraits(traits)
    }
}

function compareTraits(char1, char2) {
    const traits1 = char1.traits
    const traits2 = char2.traits
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
    const tEngagesInSexual = document.getElementById('tEngagesInSexual')
    const tSubjectOfSexual = document.getElementById('tSubjectOfSexual')

    tHair.innerHTML = '<a href="https://vndb.org/i1" class="btn btn-primary" target="_blank">Hair</a>: ' + traits['Hair'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tEyes.innerHTML = '<a href="https://vndb.org/i35" class="btn btn-primary" target="_blank">Eyes</a>: ' + traits['Eyes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tBody.innerHTML = '<a href="https://vndb.org/i36" class="btn btn-primary" target="_blank">Body</a>: ' + traits['Body'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tClothes.innerHTML = '<a href="https://vndb.org/i37" class="btn btn-primary" target="_blank">Clothes</a>: ' + traits['Clothes'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tItems.innerHTML = '<a href="https://vndb.org/i38" class="btn btn-primary" target="_blank">Items</a>: ' + traits['Items'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tPersonality.innerHTML = '<a href="https://vndb.org/i39" class="btn btn-primary" target="_blank">Personality</a>: ' + traits['Personality'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tRole.innerHTML = '<a href="https://vndb.org/i40" class="btn btn-primary" target="_blank">Role</a>: ' + traits['Role'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tEngagesIn.innerHTML = '<a href="https://vndb.org/i41" class="btn btn-primary" target="_blank">Engages in</a>: ' + traits['Engages in'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tSubjectOf.innerHTML = '<a href="https://vndb.org/i42" class="btn btn-primary" target="_blank">Subject of</a>: ' + traits['Subject of'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tEngagesInSexual.innerHTML = '<a href="https://vndb.org/i43" class="btn btn-primary" target="_blank">Engages in (Sexual)</a>: ' + traits['Engages in (Sexual)'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
    tSubjectOfSexual.innerHTML = '<a href="https://vndb.org/i1625" class="btn btn-primary" target="_blank">Subject of (Sexual)</a>: ' + traits['Subject of (Sexual)'].map(t => `<a href="https://vndb.org/${t.id}" class="btn btn-outline-primary" target="_blank">${t.name}</a>`).join(' ')
}

getStats()

window.onSearchInput = onSearchInput

const startBtn = document.getElementById('startBtn')
const result = document.getElementById('result')

let target = null
let gameStarted = false

async function handleStart() {
    gameStarted = true
    startBtn.innerText = '加载中...'

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
    result.textContent = `答案:《${getVNTitle(target)}》${target.original}`

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