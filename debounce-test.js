const debounce = require('lodash.debounce')

console.log('--- Test 1: rapid calls collapse into one ---')
let count1 = 0
const say1 = debounce(() => {
    count1++
    console.log(`func actually ran! call #${count1} at ${Date.now() % 100000}`)
}, 300)

say1(); say1(); say1()  // called 3 times instantly
console.log('called say1() three times immediately (should only actually run once, ~300ms later)')

setTimeout(() => {
    console.log('\n--- Test 2: leading:true runs on the first call too ---')
    let count2 = 0
    const say2 = debounce(() => {
        count2++
        console.log(`func actually ran! call #${count2} at ${Date.now() % 100000}`)
    }, 300, { leading: true, trailing: false })

    say2()
    console.log('called say2() once with leading:true (should run immediately, not after a delay)')
}, 1000)

setTimeout(() => {
    console.log('\n--- Test 3: invalid input ---')
    try {
        debounce('not a function', 300)
    } catch (e) {
        console.log('threw:', e.message)
    }
}, 2000)