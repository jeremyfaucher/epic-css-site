const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

module.exports = [
  ['volkswagen', 'Volkswagen'], ['citibank', 'Citibank'], ['bmw', 'BMW'],
  ['booking-com', 'Booking.com'], ['visa', 'Visa'], ['shopify', 'Shopify'],
  ['google', 'Google'], ['nasa', 'NASA'], ['tesla', 'Tesla'], ['x', 'X'],
  ['thoughtworks', 'Thoughtworks'], ['valve', 'Valve']
].map(([id, name]) => {
  const $ = cheerio.load(fs.readFileSync(path.join(__dirname, '../assets/logos', id + '.svg'), 'utf8'), { xmlMode: true });
  const svg = $('svg');
  return { id, name, viewBox: svg.attr('viewBox'), width: svg.attr('width'), height: svg.attr('height'), paths: svg.html() };
});
