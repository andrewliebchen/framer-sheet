{ Sheet } = require 'sheet'

Framer.Defaults.Layer =
	height: 40
	backgroundColor: null
	color: 'black'
	style:
		'font-size': '16px'
		'line-height': '40px'
		'padding': '0 0.5em'


sheet = new Sheet
	key: '0AmYzu_s7QHsmdDNZUzRlYldnWTZCLXdrMXlYQzVxSFE'

table = new Layer

sheet.get((data, sheet) ->
	_.map data, (row, i) ->
		@row = new Layer
			name: 'row'
			parent: table
			backgroundColor: null
			width: 600
			backgroundColor: if i % 2 then '#f0f0f0'
			x: 10
			y: 40 * i


		@name = new Layer
			html: row.Name
			name: "cell:#{row.Name}"
			parent: @row

		@category = new Layer
			html: row.Category
			name: "cell:#{row.Category}"
			parent: @row
			x: 200

		@healthiness = new Layer
			html: row.Healthiness
			name: "cell:#{row.Healthiness}"
			parent: @row
			height: 40
			x: 400
)
