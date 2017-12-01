BIN := ./node_modules/.bin

static/areas.json: shp/ac-areas.shp
	@$(BIN)/shp2json -n --encoding 'utf8' $< \
	| $(BIN)/ndjson-map 'd.id = i + "", d' \
	| $(BIN)/ndjson-reduce \
	| $(BIN)/ndjson-map '{type: "FeatureCollection", features: d}' \
	| $(BIN)/mapshaper - -simplify visvalingam keep-shapes stats interval=50 -o $@
