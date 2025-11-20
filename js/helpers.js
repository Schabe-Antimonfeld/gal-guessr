export function getVNTitle(char) {
    let originalTitle = ''
    for (const vn of char.vns) {
        if (vn.role === 'main' || vn.role === 'primary') {
            for (const titleObj of vn.titles) {
                if (titleObj.lang === 'zh-Hans') {
                    return titleObj.title
                }
                if (titleObj.lang === 'ja') {
                    originalTitle = titleObj.title
                }
            }
            return originalTitle
        }
    }
}

export function compareTraits(target, char) {
    const traits1 = target.traits
    const traits2 = char.traits
    const commonTraits = traits1.filter(t1 => traits2.some(t2 => t2.id === t1.id))
    return commonTraits
}

export function addCommonTraits(containerTraits, commonTraits) {
    commonTraits.forEach(trait => {
        if (!containerTraits[trait.group_name].some(t => t.id === trait.id)) {
            containerTraits[trait.group_name].push(trait)
        }
    })
}
