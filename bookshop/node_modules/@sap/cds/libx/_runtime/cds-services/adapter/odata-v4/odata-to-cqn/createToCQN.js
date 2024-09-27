const cds = require('../../../../cds')
const { INSERT } = cds.ql

const { getFeatureNotSupportedError } = require('../../../util/errors')
const { convertUrlPathToCqn } = require('./utils')

const { ENTITY, SINGLETON, NAVIGATION_TO_ONE } = require('../okra/odata-server').uri.UriResource.ResourceKind

const UPSERT_KINDS = {
  [ENTITY]: 1,
  [SINGLETON]: 1,
  [NAVIGATION_TO_ONE]: 1
}

/**
 * Transform odata CREATE request into a CQN object.
 *
 * @param {object} target
 * @param {object | Array} data
 * @param {object} odataReq - OKRA's req
 * @param {boolean} upsert - CREATE on PUT/PATCH
 * @throw Error - if invalid segments are provided in request
 * @private
 */
const createToCQN = (service, target, data, odataReq, upsert) => {
  const segments = odataReq.getUriInfo().getPathSegments()
  const lastSegment = odataReq.getUriInfo().getLastSegment()

  const kind = lastSegment.getKind()
  if (kind === 'ENTITY.COLLECTION' || kind === 'NAVIGATION.TO.MANY' || (upsert && UPSERT_KINDS[kind])) {
    return INSERT.into(convertUrlPathToCqn(segments, service)).entries(data)
  }

  throw getFeatureNotSupportedError(`INSERT of kind "${lastSegment.getKind()}"`)
}

module.exports = createToCQN
