const cds = require('../../../../cds')
const { UPDATE } = cds.ql

const { getFeatureNotSupportedError } = require('../../../util/errors')
const { isStreaming } = require('../utils/stream')
const { convertUrlPathToCqn } = require('./utils')

const { ENTITY, NAVIGATION_TO_ONE, PRIMITIVE_PROPERTY, SINGLETON } =
  require('../okra/odata-server').uri.UriResource.ResourceKind

const SUPPORTED_KINDS = {
  [ENTITY]: 1,
  [NAVIGATION_TO_ONE]: 1,
  [PRIMITIVE_PROPERTY]: 1,
  [SINGLETON]: 1
}

/**
 * Transform odata UPDATE request into a CQN object.
 *
 * @param {object} data - A copy of the request payload
 * @param {object} odataReq - OKRA's req
 * @throws Error - If invalid segment kind provided
 * @private
 */
const updateToCQN = (service, data, odataReq) => {
  const segments = odataReq.getUriInfo().getPathSegments()
  const segment = segments[segments.length - 1]
  const streaming = isStreaming(segments)

  if (SUPPORTED_KINDS[segment.getKind()] || streaming) {
    return UPDATE(convertUrlPathToCqn(segments, service)).data(data)
  }

  throw getFeatureNotSupportedError(`UPDATE of kind "${segment.getKind()}"`)
}

module.exports = updateToCQN
