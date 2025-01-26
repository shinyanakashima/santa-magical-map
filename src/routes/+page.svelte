<script lang="ts">
	import "../app.css";
	import maplibregl from "maplibre-gl";
	import type { FeatureCollection, Feature, LineString, GeoJsonProperties } from "geojson";
	import {
		MapLibre,
		Marker,
		Popup,
		GeoJSONSource,
		LineLayer,
		FillLayer,
	} from "svelte-maplibre-gl";

	// 「Webメルカトルは、緯度約85度以上の北極や南極周辺の地図を表現するのをあきらめ、範囲を限定した投影法」らしい
	// https://homata.gitbook.io/geodjango/hajimeteno/coordinate
	const MAX_LNG = 180; // 経度の最大表示範囲
	const MAX_LAT = 85; // 緯度の最大表示範囲

	/**
	 * Generates an array of numbers within a specified range.
	 * pythonのrange範囲を実装。要素数（minからmaxまでの範囲をstepで分割した個数）を持つ配列を生成。+1は範囲の開始点を含めるため。
	 *
	 * @param min - The starting number of the range (inclusive).
	 * @param max - The ending number of the range (exclusive).
	 * @param step - The step between each number in the range. Defaults to 1.
	 * @returns An array of numbers within the specified range.
	 *
	 * @example
	 * ```typescript
	 * range(1, 5); // [1, 2, 3, 4]
	 * range(-5, 1, 1); // [-5, -4, -3, -2]
	 * ```
	 */
	const range = (min: number, max: number, step = 1) => {
		return [...Array(Math.floor((max - min) / step) + 1).keys()].map((i) => min + i * step);
	};

	// 南緯80度～北緯80度までを、10度刻みで生成
	const lines_lat = range(-80, 80, 10).map((_lat) => {
		const featureLine: Feature<LineString, GeoJsonProperties> = {
			type: "Feature",
			properties: {},
			geometry: {
				coordinates: [
					[-MAX_LNG, _lat],
					[MAX_LNG, _lat],
				],
				type: "LineString",
			},
		};

		return featureLine;
	});
	// 西経170度～東経180度までを、10度刻みで生成
	const lines_lng = range(-170, 180, 10).map((_lng) => {
		const featureLine: Feature<LineString, GeoJsonProperties> = {
			type: "Feature",
			properties: {},
			geometry: {
				coordinates: [
					[_lng, MAX_LAT],
					[_lng, -MAX_LAT],
				],
				type: "LineString",
			},
		};

		return featureLine;
	});

	const data: FeatureCollection<LineString, GeoJsonProperties> = {
		type: "FeatureCollection",
		features: [...lines_lat, ...lines_lng],
	};

	let map: maplibregl.Map | undefined = $state.raw();
	let lnglat = $state({ lng: 143.159352581, lat: 42.929072837 });
	let lngLatText = $derived(`(${lnglat.lat.toFixed(3)}, ${lnglat.lng.toFixed(3)})`);
	let popupOpen = $state(true);
	const POPUP_OFFSET = 24;

	let offsets: maplibregl.Offset = $derived({
		top: [0, POPUP_OFFSET],
		bottom: [0, -POPUP_OFFSET],
		left: [POPUP_OFFSET, 0],
		right: [-POPUP_OFFSET, 0],
		center: [0, 0],
		"top-left": [POPUP_OFFSET, POPUP_OFFSET],
		"top-right": [-POPUP_OFFSET, POPUP_OFFSET],
		"bottom-left": [POPUP_OFFSET, -POPUP_OFFSET],
		"bottom-right": [-POPUP_OFFSET, -POPUP_OFFSET],
	});

	const BOUNDS_JAPAN = new maplibregl.LngLatBounds(
		new maplibregl.LngLat(129.41, 31.03),
		new maplibregl.LngLat(145.54, 45.55),
	);

	const popupOfLine = new maplibregl.Popup({
		closeButton: false,
		closeOnClick: false,
	});
</script>

<div class="flex items-center gap-x-4 text-sm">
	<pre class="my-1 grow">Drag santa image {lngLatText}</pre>
</div>

<MapLibre
	style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
	class="h-[100vh] min-h-[300px]"
	zoom={1}
	center={[143.159352581, 42.929072837]}
	bind:map
	maxPitch={85}
	attributionControl={false}
>
	<GeoJSONSource {data}>
		<FillLayer paint={{ "fill-color": "#2afa43" }} />
		<LineLayer
			paint={{
				"line-color": "#2afa43",
				"line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.3],
				"line-width": 5,
			}}
			onmousemove={(e) => {
				map.getCanvas().style.cursor = "pointer";
				popupOfLine.setLngLat(e.lngLat).setHTML(String(e.lngLat)).addTo(map);
			}}
			onmouseleave={() => {
				map.getCanvas().style.cursor = "";
				popupOfLine.remove();
			}}
		/>
	</GeoJSONSource>

	<Marker bind:lnglat draggable>
		{#snippet content()}
			<div class="text-center leading-none">
				<div class="text-3xl">🎅🏽</div>
				<div class="font-bold text-white drop-shadow-xs">{lngLatText}</div>
			</div>
		{/snippet}
		<Popup class="text-black" bind:open={popupOpen} offset={offsets}>
			{#if BOUNDS_JAPAN.contains(lnglat)}
				<span class="text-lg">Merry Xmas!🎄</span>
			{:else}
				<span class="text-lg">日本が恋しいのぅ...</span>
			{/if}
		</Popup>
	</Marker>
</MapLibre>
