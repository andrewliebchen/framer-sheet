{ Tabletop } = require 'npm'


class exports.Sheet
  constructor: (options) ->
    @_key = options.key

    @get = (callback) =>
      Tabletop.init {
        key: @_key
        simpleSheet: true
        callback: (data, sheet) =>
          return callback(data, sheet)
      }
