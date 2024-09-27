'use strict'

const commons = require('../../odata-commons')

const ComponentManager = require('../core/ComponentManager')
const ContentTypes = commons.format.ContentTypeInfo.ContentTypes
const PlainHttpResponse = require('../core/PlainHttpResponse')
const RepresentationKinds = commons.format.RepresentationKind.Kinds

/**
 * Class containing methods to handle application exit handlers.
 * @hideconstructor
 */
class BatchExitHandler {
  /**
   * Call the batch-start handler.
   * @param {Function} handler the handler function
   * @param {BatchContext} batchContext Batch context
   * @param {Object} data the custom application data
   * @returns {Promise} a promise
   */
  static handleBatchStart (handler, batchContext, data) {
    return new Promise((resolve, reject) => {
      try {
        handler({ applicationData: data }, error => {
          if (error) {
            batchContext.setFrameworkError(error)
            return reject(error)
          }
          return resolve()
        })
      } catch (error) {
        batchContext.setFrameworkError(error)
        reject(error)
      }
    })
  }

  /**
   * Call the batch-end handler.
   * @param {Function} handler the handler function
   * @param {BatchContext} batchContext Batch context
   * @param {Error} error a previously occurred error
   * @param {Object} data the custom application data
   * @param {BatchErrorInfo[]} failedRequests batched requests with an error status code
   * @returns {Promise} a promise
   */
  static handleBatchEnd (handler, batchContext, error, data, failedRequests) {
    return new Promise((resolve, reject) => {
      try {
        handler(error, { applicationData: data, failedRequests: failedRequests }, applicationError => {
          if (applicationError || error) {
            batchContext.setFrameworkError(applicationError || error)
            return reject(applicationError || error)
          }
          return resolve()
        })
      } catch (applicationError) {
        batchContext.setFrameworkError(error)
        reject(applicationError)
      }
    })
  }

  /**
   * Call the atomicity-group-start handler.
   * @param {Function} handler the handler function
   * @param {Object} data the custom application data
   * @param {string} id atomicity-group ID
   * @returns {Promise} a promise
   */
  static handleGroupStart (handler, data, id) {
    return new Promise((resolve, reject) => {
      try {
        handler({ applicationData: data, id: id }, error => (error ? reject(error) : resolve()))
      } catch (applicationError) {
        reject(applicationError)
      }
    })
  }

  /**
   * Overwrites some responses of an atomicity group with an given error message
   * @param {BatchContext} batchContext Batch context
   * @param {Array<string>} options Options object
   * @param {Array<string>} options.failedRequests Request ids of requests to be overwritten
   * @param {string} atomicityGroupId Atomicity group id
   * @param {Error}applicationError Application error, e.g the root causes might be an additional constrains check which triggers an rollback
   */
  static handleApplicationError (batchContext, options, atomicityGroupId, applicationError) {
    const negotiator = batchContext._incomingODataRequest._service._componentManager.getComponent(
      ComponentManager.Components.CONTENT_NEGOTIATOR
    )
    for (const req of batchContext._requests) {
      if (req.getAtomicityGroupId() === atomicityGroupId) {
        const requestId = req.getOdataRequestId()
        const response = batchContext.getResponses().get(requestId)
        // override error response

        if (options && requestId in options.failedRequests) {
          // root causes which lead to the rollback (e.g. due to additional constrains check)
          const incomingResponse = new PlainHttpResponse()
          response.setInResponse(incomingResponse)
          const contentTypeInfo = negotiator.negotiateContentType(
            batchContext._incomingODataRequest._service._formatManager,
            RepresentationKinds.ERROR,
            ContentTypes.JSON
          )
          const serializer = contentTypeInfo.getSerializerFunction()

          serializer(
            options.failedRequests[requestId],
            null,
            // eslint-disable-next-line handle-callback-err
            (error, payload) => {
              incomingResponse.setHeader('content-type', ContentTypes.JSON)

              incomingResponse.write(payload, 'utf8')
              incomingResponse.statusCode = options.failedRequests[requestId].statusCode
            }
          )

          // set response  options.failedRequests[requestId]
        }

        // mark request as failed in atomicity group
        batchContext.markRequestAsFailed(requestId, req, response, applicationError)
      }
    }
  }

  /**
   * Call the atomicity-group-end handler.
   * @param {Function} handler the handler function
   * @param {BatchContext} batchContext Batch context
   * @param {Object} data the custom application data
   * @param {string} id Atomicity group id
   * @returns {Promise.<boolean>} a promise resolving to true if the group has to be repeated, otherwise to false
   */
  static handleGroupEnd (handler, batchContext, data, id) {
    const atomicityGroupError = batchContext.getFailedAtomicityGroups().get(id)
    const failedRequests = batchContext.getFailedRequestsOfAtomicityGroup(id)
    return new Promise((resolve, reject) => {
      try {
        handler(
          atomicityGroupError,
          { applicationData: data, failedRequests: failedRequests, id: id },
          (applicationError, options) => {
            if (options && options.repeat) {
              resolve(true)
            } else if (applicationError) {
              // mark als responses of atomicity group as error
              BatchExitHandler.handleApplicationError(batchContext, options, id, applicationError)
              resolve(false)
            } else if (atomicityGroupError) {
              reject(atomicityGroupError)
            } else {
              resolve(false)
            }
          }
        )
      } catch (applicationError) {
        reject(applicationError)
      }
    })
  }
}

/**
 * @callback BatchExitHandler~next
 */

/**
 * The BatchStartHandler can be registered for batch processing,
 * it is called before the processing of batched requests starts.
 * - If the application returns or throws an error to the {@see BatchExitHandler~next} callback
 * no batched request is executed and the BatchEndHandler {@see BatchEndHandler} is called with that error.
 *
 * @callback BatchStartHandler
 * @memberOf BatchExitHandler
 * @param {Object} context
 * @param {string} context.applicationData Application data, can be set on the OdataRequest via setApplicationData(...), e.g. within the request event of the $batch request
 * @param {BatchExitHandler~next} done - Callback to be called after transaction start
 */
BatchExitHandler.BATCH_START = 'batch-start'

/**
 * The BatchEndHandler can be registered for batch processing, it is called after the batched requests are executed.
 * - If the application returns or throws an error to the {@see BatchExitHandler~next} callback this error triggers the
 * error handling of the incoming HTTP request.
 *
 * @callback BatchEndHandler
 * @memberOf BatchExitHandler
 * @param {Error} error Error object which is set in case of runtime errors and errors in previous exit handlers, but
 * not case of failed batched requests (whose error message is caught and written to a batched response)
 * @param {Object} context
 * @param {string} context.applicationData Application data, can be set on the OdataRequest via setApplicationData(...), e.g. within the request event
 * @param {BatchErrorInfo[]} context.failedRequests List of batched requests which returned with an error status code
 * @param {BatchExitHandler~next} done - Callback to be called after transaction start
 */
BatchExitHandler.BATCH_END = 'batch-end'

/**
 * The AtomicityGroupStartHandler can be registered for batch processing, it is called before the first request of an
 * atomicity group /change set is processed.
 * - If the application returns or throws an error to the {@see BatchExitHandler~next} callback
 * the atomicity group is marked as not executed and further batched requests are executed if continue-on-error is true.
 * This error is also forwarded to the {@see AtomicityGroupEndHandler} handler.
 *
 * @callback AtomicityGroupStartHandler
 * @memberOf BatchExitHandler
 * @param {Object} context
 * @param {string} context.applicationData Application data, can be set on the OdataRequest via setApplicationData(...), e.g. within the request event
 * @param {string} context.id Atomicity group id
 * @param {BatchExitHandler~next} done - Callback to be called after transaction start
 */
BatchExitHandler.ATOMICITY_GROUP_START = 'atomicity-group-start'

/**
 * The AtomicityGroupEndHandler can be registered for batch processing it is called after all batched requests of an
 * atomicity group / change set are processed
 * - If the application returns or throws an error to the BatchExitHandler~next callback
 * the atomicity group is marked as not executed and further batched requests are executed if continue-on-error is true.
 * - AtomicityGroupEndHandler is called in both cases, error and non error.
 *
 * @callback AtomicityGroupEndHandler
 * @memberOf BatchExitHandler
 * @param {Error} error Error object which is set in case of runtime errors and errors in previous exit handlers, but
 * not case of failed batched requests (whose error message is catched and written to a batched response)
 * @param {Object} context
 * @param {string} context.applicationData Application data, can be set on the OdataRequest via setApplicationData(...), e.g. within the request event
 * @param {Error[]} context.failedRequests List of batch requests which failed and whose error message is written to a batched response. This list
 *     may be used to implement some kind of transaction handling
 * @param {string} context.id Atomicity group id
 * @param {BatchExitHandler~next} done - Callback to be called after transaction start
 */
BatchExitHandler.ATOMICITY_GROUP_END = 'atomicity-group-end'

module.exports = BatchExitHandler
