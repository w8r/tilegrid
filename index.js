var TILE_SIZE  = 256;
var DEG_TO_RAD = 180 / Math.PI;
var RAD_TO_DEG = Math.PI / 180;

var origin    = null;
var pxPerDegX = 0;
var pxPerRadY = 0;


/**
 * Calculates world size and origin for given zoom
 * @param  {Number} zoom
 */
function calculateScale (zoom) {
  var planeSize    = TILE_SIZE * Math.pow(2, zoom);

  pxPerDegX = planeSize / 360;
  pxPerRadY = planeSize / (2 * Math.PI);

  var halfplaneSize = planeSize / 2;
  origin = [halfplaneSize, halfplaneSize];
}


/**
 * @param  {Object} coord
 * @param  {Number} zoom
 * @return {Array.<Number>}
 */
function latlngToPixel (coord, zoom) {
  calculateScale(zoom);

  var x = Math.round(origin[0] + (coord.lng * pxPerDegX));
  var f = Math.sin(coord.lat * RAD_TO_DEG);
  var y = Math.round(origin[1] + 0.5 * Math.log((1 + f) / (1 - f)) * -pxPerRadY);
  return [x, y];
}


/**
 * @param  {Array.<Number>} coord [x, y]
 * @param  {Number}         zoom
 * @return {Object}
 */
function pixelToLatLng (coord, zoom) {
  calculateScale(zoom);

  var longitude = (coord[0] - origin[0]) / pxPerDegX;
  var latitude = (2 * Math.atan(Math.exp((coord[1] - origin[1]) / -pxPerRadY)) - Math.PI / 2) * DEG_TO_RAD;

  return {
    lat: latitude,
    lng: longitude
  };
}


/**
 * Covers element with tiles
 *
 * @param  {Element} element
 * @param  {LatLng}  center
 * @param  {Number}  zoom
 * @param  {Number=} tilesX
 * @param  {Number=} tilesY
 * @param  {Number=} w viewport width
 * @param  {Number=} h viewport height
 */
function tiles (element, center, zoom, tilesX, tilesY, w, h) {
  tilesX = tilesX || 3;
  tilesY = tilesY || 3;

  var projected = latlngToPixel(center, zoom);
  var tx = Math.floor(projected[0] / TILE_SIZE) - Math.floor(tilesX / 2);
  var ty = Math.floor(projected[1] / TILE_SIZE) - Math.floor(tilesY / 2);

  var wrapper = document.createElement('div');

  for (var y = ty; y < ty + tilesY; y++) {
    for (var x = tx; x < tx + tilesX; x++) {
      var img = new Image();
      img.src = getTileUrl(x, y, zoom);
      img.style.width = img.style.height = TILE_SIZE + 'px';
      img.style.padding = img.style.margin = 0;
      img.style.display = 'inline-block';
      //img.style.position = 'absolute';

      wrapper.appendChild(img);
    }
  }

  wrapper.style.lineHeight = 0;
  wrapper.style.position = 'relative';
  wrapper.style.width  = tilesX * TILE_SIZE + 'px';
  wrapper.style.height = tilesY * TILE_SIZE + 'px';

  // center pos in grid
  var gridPos = [projected[0] - tx * TILE_SIZE, projected[1] - ty * TILE_SIZE];

  element.appendChild(wrapper);
  var viewPort = [
    (w || element.offsetWidth)  / 2 - gridPos[0],
    (h || element.offsetHeight) / 2 - gridPos[1]
  ];

  //wrapper.insertBefore(d, wrapper.firstChild);

  wrapper.style.left  = viewPort[0] + 'px';
  wrapper.style.top   = viewPort[1] + 'px';

}


// Wikimapia tile url
function getTileUrl (x, y, z) {
  return 'http://i' + (x % 4 + (y % 4) * 4) +
    '.wikimapia.org/?x=' + x +'&y=' + y  + '&zoom=' + z + '&type=map&r=0';
  //return 'http://a.tile.osm.org/' + z +'/' + x  + '/' + y + '.png';
}

tiles(document.querySelector('#map'), { lat: 55.76388118113213, lng: 37.592103481292725 }, 17, 3, 2);
