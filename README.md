# MTG Index

[![build](https://github.com/KonradHoeffner/mtgindex/actions/workflows/build.yml/badge.svg)](https://github.com/KonradHoeffner/mtgindex/actions/workflows/build.yml)

A transformation of the [Scryfall bulk data](https://scryfall.com/docs/api/bulk-data) to smaller files where each file occurs only once that you can directly include in your JavaScript code.
Suitable for applications that do not discern between different printings of a card, such as commander decklists.

## Variants
All variants contain the 'large' 672 × 936 JPG image format from Scryfall, you can replace 'large' with 'png', 'normal' or 'small' for the others, see <https://scryfall.com/docs/api/images>. 

- image only [image.js](https://konradhoeffner.github.io/mtgindex/mtgimg.js)
- image only [image.json](https://konradhoeffner.github.io/mtgindex/mtgimg.json)
- detailed [detail.js](https://konradhoeffner.github.io/mtgindex/mtgindex.js) includes type\_line, colors, color\_identity and cmc

## Structure

```js
var mtgimg = 
{
  "+2 Mace": "https://c1.scryfall.com/file/scryfall-cards/large/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1627701221",
  "A Little Chat": "https://c1.scryfall.com/file/scryfall-cards/large/front/4/d/4d7424b6-b56a-47b7-8204-294d3dca925f.jpg?1649366594",
  "Aarakocra Sneak": "https://c1.scryfall.com/file/scryfall-cards/large/front/2/a/2a83882c-3e03-4e85-aaac-97fa1d08a772.jpg?1652832662",
[...]
```

```js
var mtgindex = 
{
  "+2 Mace": {
    "img": "https://c1.scryfall.com/file/scryfall-cards/large/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1627701221",
    "colors": [
      "W"
    ],
    "mana_cost": "{1}{W}",
    "cmc": 2,
    "type_line": "Artifact — Equipment",
    "color_identity": [
      "W"
    ]
    ...
```


## Direct Usage from your JavaScript code

```js
<script src="https://konradhoeffner.github.io/mtgindex/mtgimg.js"></script> <!-- image only -->
<script src="https://konradhoeffner.github.io/mtgindex/mtgindex.js"></script>  <!-- detailed -->
```

## JSON using Fetch API

```js
<script>                      
const mtgIndex = fetch('https://konradhoeffner.github.io/mtgindex/mtgimg.json').then(i=>i.json());
[...]
async myFunction(cardName) {
  const imgUrl = (await mtgIndex)[cardName];
}
</script>
```

Or if you don't need to reuse the index (else you waste a lot of time and bandwidth):

```js
async myFunction() {
  const mtgIndex = await (await fetch('https://konradhoeffner.github.io/mtgindex/mtgimg.json')).json();
  const imgUrl1 = mtgIndex["Kird Ape"];
  const imgUrl2 = mtgIndex["Lightning Bolt"];
}
```

## Developer Maintenance

Run `npm run download` and `npm run build` to recreate the index in cards.js after a new edition is published on Scryfall. Requires node.
This is done automatically using a GitHub action, [currently at 1:00 AM every Monday](https://github.com/KonradHoeffner/mtgindex/blob/master/.github/workflows/build.yml).

## Motivation

While Scryfall has a [well documented REST API](https://scryfall.com/docs/api), it is limited to around 10 requests per second.
Its bulk data on the other hand is too large with around 251 MB as it includes all printings of all cards, including tokens, and attributes like image links of different sizes, the oracle text and shopping website identifiers.
This index is an opinionated selection of attributes and between different prints based on my asthetic preferences, generally preferring old borders and original printings.
