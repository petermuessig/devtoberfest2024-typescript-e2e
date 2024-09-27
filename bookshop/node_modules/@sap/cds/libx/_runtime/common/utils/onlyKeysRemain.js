module.exports = req => {
  // if custom handlers uses only expression like {col: {'+=': 1}},
  // req.data will only contain the keys
  if (req.query.UPDATE.with && Object.keys(req.query.UPDATE.with).length > 0) {
    return false
  }

  const keys = Object.keys(req.target.keys || {})
  return !Object.keys(req.data).some(k => !keys.includes(k))
}
