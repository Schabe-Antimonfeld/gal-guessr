import { getStats, getVN, getRandChar } from './api.js'
import { loadDict, traits } from './data.js'
import { onSearchInput, showDropdown, renderTraits } from './ui.js'

window.onSearchInput = onSearchInput

const startBtn = document.getElementById('startBtn')
const result = document.getElementById('result')

let target = null
let gameStarted = false

function checkGuess(char) {
    if (!target) return
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
                            <p class="card-text" style="font-size: smaller; color: gray;">${(char.vns && char.vns.length > 0 ? `${char.vns[0].titles.find(t => t.lang === 'zh-Hans') ? char.vns[0].titles.find(t => t.lang === 'zh-Hans').title : (char.vns[0].titles.find(t => t.lang === 'ja') ? char.vns[0].titles.find(t => t.lang === 'ja').title : '')}` : '')}</p>
                        </div>
                    </div>
                </div>
            </div>
            `
        const commonTraits = (window.compareTraits ? window.compareTraits(target, char) : [])
        if (window.addCommonTraits) {
            window.addCommonTraits(traits, commonTraits)
        }
        if (window.renderTraits) {
            window.renderTraits(traits)
        } else {
            renderTraits(traits)
        }
    }
}

window.checkGuess = checkGuess

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
                        <p class="card-text" style="font-size: smaller; color: gray;">${(target.vns && target.vns.length > 0 ? ` ${target.vns[0].titles.find(t => t.lang === 'zh-Hans') ? target.vns[0].titles.find(t => t.lang === 'zh-Hans').title : (target.vns[0].titles.find(t => t.lang === 'ja') ? target.vns[0].titles.find(t => t.lang === 'ja').title : '')}` : '')}</p>
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

import('./helpers.js').then(mod => {
    window.compareTraits = mod.compareTraits
    window.addCommonTraits = mod.addCommonTraits
})

window.renderTraits = renderTraits

getStats()
loadDict()
