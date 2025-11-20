import { getStats, getVN, getRandChar } from './api.js'
import { loadDict, traits } from './data.js'
import { renderTraits, showToast } from './ui.js'
import { getVNTitle } from './helpers.js'

const startBtn = document.getElementById('startBtn')
const result = document.getElementById('result')
const history = document.querySelector('.history')

let target = null
let gameStarted = false
let attempts = 0

function checkGuess(char) {
    if (!target) return
    attempts += 1
    if (history.innerHTML.includes('记录空空如也喵~')) {
        history.innerHTML = ''
    }
    history.innerHTML +=
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
    if (char.original === target.original) {
        handleEnd()
    } else {
        showToast('猜错了喵~', '欧吉桑真是杂鱼~', 'danger')
        result.innerHTML = 
            `
            <div class="card text-center " style="width: 22rem;">
                <h3 class="card-header" style="background-color: red;"></h3>
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${char.image ? char.image.url : ''}" alt="" height="150" width="128">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body text-wrap">
                            <h5 class="card-title">${(char.original ? char.original : char.name)}</h5>
                            <p class="card-text" style="font-size: smaller; color: gray;">${(char.vns && char.vns.length > 0 ? `${getVNTitle(char)}` : '')}</p>
                            <p class="card-text" style="font-size: smaller; color: gray;">尝试次数: ${attempts}</p>
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
    showToast('初始化成功喵~', `共搜索到 ${vns.length} 部符合条件的作品喵~`)

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
        <div class="card text-center " style="width: 22rem;">
            <h3 class="card-header" style="background-color: green;"></h3>
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${target.image ? target.image.url : ''}" alt="" height="150" width="128">
                </div>
                <div class="col-md-8">
                    <div class="card-body text-wrap">
                        <h5 class="card-title">${(target.original ? target.original : target.name)}</h5>
                        <p class="card-text" style="font-size: smaller; color: gray;">${(target.vns && target.vns.length > 0 ? ` ${getVNTitle(target)}` : '')}</p>
                        <p class="card-text" style="font-size: smaller; color: gray;">尝试次数: ${attempts}</p>
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
        showToast('猜不出来了？', '这就认输啦，杂鱼欧吉桑~', 'warning')
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
