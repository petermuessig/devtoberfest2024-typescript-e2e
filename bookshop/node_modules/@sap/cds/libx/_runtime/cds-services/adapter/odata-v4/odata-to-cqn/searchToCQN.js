const odata = require('../okra/odata-server')
const { BINARY, LITERAL, UNARY } = odata.uri.Expression.ExpressionKind
const { getFeatureNotSupportedError } = require('../../../util/errors')

const _getExpressionKindName = kind => {
  for (const key in odata.uri.Expression.ExpressionKind) {
    if (odata.uri.Expression.ExpressionKind[key] === kind) {
      return key
    }
  }

  return 'unknown'
}

/**
 * Convert an OData search expression into a search CQN expression.
 *
 * @param {import('../okra/odata-commons/uri/Expression')} search - search expression
 * @throws Error in case of any other expressions than `BINARY`, `UNARY` and `LITERAL`
 * @returns {Array<object>} `CQN` search expression
 */
const searchToCQN = search => {
  switch (search.getKind()) {
    case BINARY: {
      const leftOperand = searchToCQN(search.getLeftOperand())
      const operator = search.getOperator().toLowerCase()
      const rightOperand = searchToCQN(search.getRightOperand())
      const searchTerm = [...leftOperand, operator, ...rightOperand]
      return searchTerm
    }

    case LITERAL:
      return [{ val: search.getText() }]

    case UNARY:
      return [search.getOperator(), { val: search.getOperand().getText() }]

    default:
      throw getFeatureNotSupportedError(`Search expression "${_getExpressionKindName(search.getKind())}"`)
  }
}

module.exports = searchToCQN
