/** Requires that "scryfall-default-cards.json" is available.
Read Scryfall JSON and transform it into a data structure that can be accessed more quickly and that only contains card name and image URL for the first print.*/
const fs = require("fs");
const data = fs.readFileSync("scryfall-default-cards.json");
let cards = JSON.parse(data);
const indexBase = [];

const tmp = [];

// split double faced cards and filter out ignored cards
for (let card of cards) {
	if (new Date(card.released_at) < new Date() && card.legalities.vintage == "not_legal") continue;
	if (card.set_name === "San Diego Comic-Con 2015") continue;
	if (card.promo) continue; // promos should have normal versions, which look better on screen
	if (card.lang !== "en") continue; // ignore japanese alternate art
	if (card.type_line?.startsWith("Token")) continue; // ignore tokens
	if (card.name.includes("//") && !card.image_uris && !!card.card_faces) {
		const [frontName, backName] = card.name.split(" // ");
		[front, back] = [Object.assign({}, card), Object.assign({}, card)];
		front.name = frontName;
		back.name = backName;
		front.image_uris = card.card_faces[0].image_uris;
		back.image_uris = card.card_faces[1].image_uris;
		tmp.push(front);
		tmp.push(back);
	} else {
		tmp.push(card);
	}
}
cards = tmp;

// sorting by release date and then stable sorting by frame would be simpler but didn't work in practise and changed the order creating large diffs on cards.js
for (let card of cards) {
	if (indexBase[card.name]) {
		if (card.released_at < indexBase[card.name].first_release) {indexBase[card.name].first_release = card.released_at}
		// prefer first printing
		// exception: new printing has older frame
		if (parseInt(indexBase[card.name].frame) < parseInt(card.frame) || (parseInt(indexBase[card.name].frame) == parseInt(card.frame) && indexBase[card.name].released_at < card.released_at)) {continue;}
	}
	const uris = card.image_uris;
	if (!uris) {
		console.error("No images for card " + card.name + " " + card.uri);
		continue;
	}
	first_release = card.released_at
	if (indexBase[card.name] && indexBase[card.name].first_release < first_release) {first_release = indexBase[card.name].first_release}
	indexBase[card.name] = {
		url: card.image_uris.large,
		released_at: card.released_at,
		first_release,
		frame: card.frame,
		colors: card.colors,
		cmc: card.cmc,
		mana_cost: card.mana_cost,
		type_line: card.type_line,
		color_identity: card.color_identity,
		power: card.power,
		toughness: card.toughness
	};
}
const index = {}; // [] does not work with associative arrays with stringify
let index2 = {};
for (let key in indexBase) {
	index[key] = indexBase[key].url;
	const ib = indexBase[key];
	index2[key] = { img: ib.url, date: ib.first_release, colors: ib.colors, mana_cost: ib.mana_cost, cmc: ib.cmc, type_line: ib.type_line, color_identity: ib.color_identity, power: ib.power, toughness: ib.toughness };
}
function write(obj, filename, varname) {
	obj = Object.fromEntries(Object.entries(obj).sort()); // reduce diff size
	let content = JSON.stringify(obj, null, 2);
	if (varname) content = "var " + varname + " = \n" + content + ";";
	fs.writeFile(filename, content, "utf8", (error) => {
		if (error) console.error(error);
	});
}

write(index, "index/mtgimg.js", "mtgimg");
write(index, "index/mtgimg.json");
write(index2, "index/mtgindex.js", "mtgindex");
write(index2, "index/mtgindex.json");
