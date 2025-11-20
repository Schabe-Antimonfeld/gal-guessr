const url = 'https://api.vndb.org/kana/'

export async function getStats() {
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

export async function getVN(difficulty = 'normal') {
    try {
        let vn = []
        let page = 1
        let finished = false
        let filters = []
        switch (difficulty) {
            case 'easy':
                filters = [
                    'and',
                    ['developer', '=', ['id', '=', 'p98']],     // Yuzusoft
                    ['released', '>=', '2015-01-31']
                ]   
                break
            case 'normal':
                filters =[
                    'and',
                    ['olang', '=', 'ja'],
                    ['or',
                        ['length', '=', 3],
                        ['length', '=', 4],
                        ['length', '=', 5]
                    ],
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
                    ['tag', '!=', 'g350'],   // Interactive Adventure Game
                    ['tag', '!=', 'g542']    // Otome Game
                ]
                break
            case 'hard':
                filters = [
                    'and',
                    ['olang', '=', 'ja'],
                    ['or',
                        ['length', '=', 3],
                        ['length', '=', 4],
                        ['length', '=', 5]
                    ],
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
                    ['tag', '!=', 'g350'],   // Interactive Adventure Game
                    ['tag', '!=', 'g542']    // Otome Game
                ]
                break
            case 'insane':
                filters = [
                    'and',
                    ['olang', '=', 'ja'],
                    ['or',
                        ['length', '=', 3],
                        ['length', '=', 4],
                        ['length', '=', 5]
                    ],
                    ['votecount', '>=', 300],
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
                    ['tag', '!=', 'g350'],   // Interactive Adventure Game
                    ['tag', '!=', 'g542']    // Otome Game
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

export async function getRandChar(vn) {
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
                fields: 'name,original,image.url,traits{id,name,group_name,spoiler},vns{titles{title,lang},role}',
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

export async function searchChar(name, page = 1) {
    try {
        const response = await fetch(url + 'character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filters: [
                    'and',
                    ['search', '=', name],
                    ['vn', '=', [
                        'or',
                        ['developer', '=', ['id', '=', 'p98']],     // Yuzusoft
                        ['and',
                        ['olang', '=', 'ja'],
                        ['or',
                            ['length', '=', 3],
                            ['length', '=', 4],
                            ['length', '=', 5]
                        ],
                        ['votecount', '>=', 300],
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
                        ['tag', '!=', 'g350'],   // Interactive Adventure Game
                        ['tag', '!=', 'g542']    // Otome Game
                    ]]],
                    ['gender', '=', 'f'],
                    ['or',
                    ['role', '=', 'main'],
                    ['role', '=', 'primary']],
                ],
                fields: 'name,original,image.url,traits{id,name,group_name,spoiler},vns{titles{title,lang},role}',
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
