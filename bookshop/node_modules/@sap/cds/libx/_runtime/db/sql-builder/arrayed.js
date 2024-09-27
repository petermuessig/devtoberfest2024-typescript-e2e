const isArrayedElement = v => Array.isArray(v) && !Buffer.isBuffer(v)
const stringifyIfArrayedElement = v => (isArrayedElement(v) ? JSON.stringify(v) : v)

module.exports = { isArrayedElement, stringifyIfArrayedElement }
