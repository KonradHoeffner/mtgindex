# MTG Index

A transformation of the [Scryfall bulk data](https://scryfall.com/docs/api/bulk-data) to smaller files where each file occurs only once that you can directly include in your JavaScript code.
Suitable for applications that do not discern between different printings of a card, such as commander decklists.

## Variants

- image only [image.js](https://konradhoeffner.github.io/mtgindex/image.js)
- detailed [detail.js](https://konradhoeffner.github.io/mtgindex/detail.js) includes type\_line, colors, color\_identity and cmc

## Direct Usage from your JavaScript code

## Setup

Run `npm run download` and `npm run build` to recreate the index in cards.js after a new edition is published on Scryfall. Requires node.

## Motivation

While Scryfall has a [well documented REST API](https://scryfall.com/docs/api), it is limited to around 10 requests per second.
Its bulk data on the other hand is too large with around 251 MB as it includes all printings of all cards, including tokens, and attributes like image links of different sizes, the oracle text and shopping website identifiers.
This index is an opinionated selection of attributes and between different prints based on my asthetic preferences, generally preferring old borders and original printings.
