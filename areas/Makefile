BIN := ./node_modules/.bin

# geojson/Cofan.geojson: shp/Cofan-AC-201707.shp
# geojson/Siekopai.geojson: shp/Siekopai-AC-201707.shp
# geojson/Siona.geojson: shp/Siona-AC-201707.shp
# geojson/Waorani.geojson: shp/Waorani-AC-201707.shp

ndjson/%.json: shp/%-AC-201707.shp
	mkdir -p $(dir $@)
	@$(BIN)/shp2json -n --encoding 'utf8' $< > $@

merged.json: ndjson/Cofan.json ndjson/Siekopai.json ndjson/Siona.json ndjson/Waorani.json
	cat $+ | ndjson-map 'd.properties.nacionalidad = d.properties.Nacionalid, d.id = i + "", delete d.properties.Nacionalid, d.properties.name = d.properties.Nombre, delete d.properties.Nombre, delete d.properties.id, d' | ndjson-reduce | ndjson-map '{type: "FeatureCollection", features: d}' > $@

areas.json: merged.json
	./node_modules/.bin/mapshaper $< -simplify visvalingam keep-shapes stats interval=50 -o $@
