const http = require('http')
class Axios {
  get axios() {
    const axios = require('axios').create ({
      headers: { 'Content-Type': 'application/json' },
      httpAgent: new http.Agent({ keepAlive: false}),
      baseURL: this.url,
    })
    // fill in baseURL on subsequent this.url = url, after server has started
    Reflect.defineProperty (this, 'url', { configurable: true, set: url => {
      Reflect.defineProperty (this, 'url', { value: url })
      axios.defaults.baseURL = url
    }})
    return super.axios = axios
  }
  get     (..._) { return this.axios.get     (..._args(_)) .catch(_error) }
  put     (..._) { return this.axios.put     (..._args(_)) .catch(_error) }
  post    (..._) { return this.axios.post    (..._args(_)) .catch(_error) }
  patch   (..._) { return this.axios.patch   (..._args(_)) .catch(_error) }
  delete  (..._) { return this.axios.delete  (..._args(_)) .catch(_error) }
  options (..._) { return this.axios.options (..._args(_)) .catch(_error) }

  /** @type typeof _.get     */ get GET()     { return this.get     .bind (this) }
  /** @type typeof _.put     */ get PUT()     { return this.put     .bind (this) }
  /** @type typeof _.post    */ get POST()    { return this.post    .bind (this) }
  /** @type typeof _.patch   */ get PATCH()   { return this.patch   .bind (this) }
  /** @type typeof _.delete  */ get DELETE()  { return this.delete  .bind (this) }
  /** @type typeof _.delete  */ get DEL()     { return this.delete  .bind (this) } //> to avoid conflicts with cds.ql.DELETE
  /** @type typeof _.options */ get OPTIONS() { return this.options .bind (this) }

}

const _args = (args) => {
  const first = args[0], last = args[args.length-1]
  if (first.raw) {
    if (first[first.length-1] === '' && typeof last === 'object')
      return [ String.raw(...args.slice(0,-1)), last ]
    return [ String.raw(...args) ]
  }
  else if (typeof first !== 'string')
    throw new Error (`Argument path is expected to be a string but got ${typeof first}`)
  return args
}

const _error = (e) => {
  if (e.errors) e = e.errors[0] // Node 20 sends AggregationErrors
  if (e.code && e.port === 80 /* default port */) throw Object.assign (e, {
    message:  e.message + '\nIt seems that the server was not started. Make sure to call \'cds.test(...)\' or \'cds.test.run(...)\'.',
    stack: null // stack is just clutter here
  })
  // Create new instance of Error to overcome AxiosError's inferior and cluttered output
  const err = new Error (e.message); err.code = e.code
  Object.defineProperty (err, 'response', { value: e.response, enumerable:false })
  // Add original error thrown by the service, if exists
  const o = err.response?.data?.error ; if (!o) throw err
  err.message = !o.code || o.code == 'null' ? o.message : `${o.code} - ${o.message}`
  err.cause = o instanceof Error ? o : Object.assign (new Error, o)
  // Object.defineProperty (o, 'stack', { enumerable:false }) //> allow strict equal checks against {code,message}
  throw err
}

const _ = Axios.prototype // eslint-disable-line no-unused-vars
module.exports = Axios
