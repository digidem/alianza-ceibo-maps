# geojson/Cofan.geojson: shp/Cofan-AC-201707.shp
# geojson/Siekopai.geojson: shp/Siekopai-AC-201707.shp
# geojson/Siona.geojson: shp/Siona-AC-201707.shp
# geojson/Waorani.geojson: shp/Waorani-AC-201707.shp

geojson/%.geojson: shp/%-AC-201707.shp
	ogr2ogr -f 'GeoJSON' -sql 'SELECT Nacionalid AS nacionalidad, Nombre AS name FROM ${$<}' $@ $<

merged.geojson: geojson/Cofan.geojson geojson/Siekopai.geojson geojson/Siona.geojson geojson/Waorani.geojson
	./node_modules/.bin/geojson-merge $+ > $@

areas.json: merged.geojson
	./node_modules/.bin/mapshaper $< -simplify visvalingam keep-shapes stats interval=50 -o $@
