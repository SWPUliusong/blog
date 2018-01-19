// function cloneJSON(json) {
//     let result = null
//     if (json instanceof Array) {
//         result = json.map(i => cloneJSON(i))
//     } else if (json instanceof Object) {
//         result = {}
//         let keys = Object.keys(json)
//         keys.forEach(key => {
//             result[key] = cloneJSON(json[key])
//         })
//     } else {
//         result = json
//     }

//     return result
// }

// let obj = { a: 1, b: [1, 2], c: [{ a: 1, b: 2 }, { a: 3, b: 4 }] }

// let copyObj = cloneJSON(obj)

// copyObj.a = 2
// copyObj.b.push(3)
// copyObj.c[0].a = 123

// console.log(obj)
// console.log(copyObj)