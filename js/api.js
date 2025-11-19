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
                    ['developer', '=', ['id', '=', 'p98']],
                    ['released', '>=', '2015-01-31']
                ]   
                break
            case 'normal':
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
                            ['id', '=', 'p24'],
                            ['id', '=', 'p146'],
                            ['id', '=', 'p82'],
                            ['id', '=', 'p11'],
                            ['id', '=', 'p3354'],
                            ['id', '=', 'p336']
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],
                    ['tag', '!=', 'g33'],
                    ['tag', '!=', 'g350']
                ]
                break
            case 'hard':
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
                            ['id', '=', 'p24'],
                            ['id', '=', 'p146'],
                            ['id', '=', 'p82'],
                            ['id', '=', 'p11'],
                            ['id', '=', 'p3354'],
                            ['id', '=', 'p336']
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],
                    ['tag', '!=', 'g33'],
                    ['tag', '!=', 'g350']
                ]
                break
            case 'insane':
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
                            ['id', '=', 'p24'],
                            ['id', '=', 'p146'],
                            ['id', '=', 'p82'],
                            ['id', '=', 'p11'],
                            ['id', '=', 'p3354'],
                            ['id', '=', 'p336']
                        ]]]
                    ]],
                    ['tag', '!=', 'g35'],
                    ['tag', '!=', 'g33'],
                    ['tag', '!=', 'g350']
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
                                ['id', '=', 'p24'],
                                ['id', '=', 'p146'],
                                ['id', '=', 'p82'],
                                ['id', '=', 'p11'],
                                ['id', '=', 'p3354'],
                                ['id', '=', 'p336']
                            ]]]
                        ]],
                        ['tag', '!=', 'g35'],
                        ['tag', '!=', 'g33'],
                        ['tag', '!=', 'g350']
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
