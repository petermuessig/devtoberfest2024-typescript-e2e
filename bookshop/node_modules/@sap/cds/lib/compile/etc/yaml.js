const { readFileSync } = require('fs')

/** Proxy to yaml */
try {
  const { yaml } = require('@sap/cds-foss')
  const parser = module.exports = {
    read (file) { return parser.parse (readFileSync(file,'utf-8')) },
    parse (src) {
      const all = yaml.parseAllDocuments(src).map (each => each.toJSON())
      return all.length > 1 ? all : all[0]
    },
  }
}
catch(e) { throw e.code !== 'MODULE_NOT_FOUND' ? e : new Error (`

  Using 'cds.parse.yaml' requires package 'yaml' to be installed, e.g.:
  npm add yaml

`)}
