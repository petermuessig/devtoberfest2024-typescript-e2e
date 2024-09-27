const CQN_TEMPLATE_STRING = JSON.stringify(require('./unionCqnTemplate'))

function getCQNUnionFrom(columns, active, draft, keys, user) {
  let cqn = CQN_TEMPLATE_STRING

  const activeCols = []
  const draftCols = []
  for (const col of columns) {
    activeCols.push(`{ "ref": ["${col}"] }`)
    draftCols.push(`{ "ref": ["${draft}", "${col}"] }`)
  }
  cqn = cqn.replace(/"%%ACTIVE_COLUMNS%%"/g, activeCols.join(', '))
  cqn = cqn.replace(/"%%DRAFT_COLUMNS%%"/g, draftCols.join(', '))

  cqn = cqn.replace(/%%ACTIVE%%/g, active)
  cqn = cqn.replace(/%%DRAFT%%/g, draft)

  const keyCondition = []
  for (const key of keys) {
    keyCondition.push(`{ "ref": ["${active}", "${key}"] }, "=", { "ref": ["${draft}", "${key}"] }`)
  }
  cqn = cqn.replace(/"%%KEYS%%"/g, keyCondition.join(', "and", '))

  cqn = cqn.replace(/%%USER%%/g, user)

  return JSON.parse(cqn)
}

module.exports = {
  getCQNUnionFrom
}
