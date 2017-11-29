BIN := ./node_modules/.bin

ndjson/%.json: shp/%-AC-201707.shp
	mkdir -p $(dir $@)
	@$(BIN)/shp2json -n --encoding 'utf8' $< > $@

areas.json: ndjson/Kofan.json ndjson/Siekopai.json ndjson/Siona.json ndjson/Waorani.json
	cat $+ | $(BIN)/ndjson-map 'd.properties.nacionalidad = d.properties.Nacionalid, d.id = i + "", delete d.properties.Nacionalid, d.properties.name = d.properties.Nombre, delete d.properties.Nombre, delete d.properties.id, d' | $(BIN)/ndjson-reduce | $(BIN)/ndjson-map '{type: "FeatureCollection", features: d}' | $(BIN)/mapshaper - -simplify visvalingam keep-shapes stats interval=50 -o - | $(BIN)/underscore print > $@
