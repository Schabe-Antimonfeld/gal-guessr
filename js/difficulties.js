const options = document.querySelectorAll('.selector-option')
const background = document.querySelector('.selector-background')
const currentDescription = document.getElementById('currentDescription')
const currentSelection = document.getElementById('currentSelection')
const selectorContainer = document.getElementById('selector')
const enableBtn = document.getElementById('enableBtn')
const disableBtn = document.getElementById('disableBtn')

const colors = ['#ffc107', '#28a745', '#007bff', '#dc3545']
const descriptions = [
    'Ciallo～(∠・ω< )⌒★\n仅含柚子社魔宴以及之后作品\n截止2025.11.06共6部',
    '30岁还是童贞，是(手)纸上的魔法使\nVNDB评分数≥2000且评分≥7.0的作品\n截至2025.11.06共96部(没有纸魔)',
    '给老资历跪了😭\nVNDB评分数≥1000且评分≥6.5的作品\n截至2025.11.06共203部',
    '玩过的gal比你吃过的米还多\nVNDB评分数≥500且评分≥6.0的作品\n截至2025.11.06共409部'
]

function initBackground() {
    const activeOption = document.querySelector('.selector-option.active')
    updateBackground(activeOption)
}

function updateBackground(option) {
    const index = parseInt(option.dataset.index)
    background.style.left = option.offsetLeft + 'px'
    background.style.width = option.offsetWidth + 'px'
    background.style.backgroundColor = colors[index]
    currentSelection.textContent = option.textContent
    currentSelection.style.backgroundColor = colors[index]
    currentDescription.textContent = descriptions[index]
}

options.forEach(option => {
    option.addEventListener('click', function() {
        options.forEach(opt => opt.classList.remove('active'))
        this.classList.add('active')
        updateBackground(this)
    })
})

initBackground()

window.addEventListener('resize', initBackground)