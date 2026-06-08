/** Requires that "scryfall-default-cards.json" is available.
Read Scryfall JSON and transform it into a data structure that can be accessed more quickly and that only contains card name and image URL for the first print.*/
import fs from "node:fs";
import { streamArray } from "stream-json/streamers/stream-array.js";
import chain from "stream-chain";
// old synchronous approach fails with ERR_STRING_TOO_LONG since 2026 because the file went over the max v8 String limit of 512 MB
// const data = fs.readFileSync("scryfall-default-cards.json"); // max buffer size 2 GB
// let cards = JSON.parse(data);
const filename = "scryfall-default-cards.json";

async function createIndex() {
	const indexBase = {};
	// rough estimate
	const cards = [100_000];
	let count = 0;

	const pipeline = chain([fs.createReadStream(filename), streamArray.withParser()]);

	// split double faced cards and filter out ignored cards
	for await (const { key, value } of pipeline) {
		const card = value;
		if (key % 10_000 == 0) console.log(`Processed ${key} cards...`);
		if (new Date(card.released_at) < new Date() && card.legalities.vintage == "not_legal") continue;
		if (card.set_name === "San Diego Comic-Con 2015") continue;
		if (card.promo) continue; // promos should have normal versions, which look better on screen
		if (card.lang !== "en") continue; // ignore japanese alternate art
		if (card.type_line?.startsWith("Token")) continue; // ignore tokens
		if (card.name.includes("//") && !card.image_uris && !!card.card_faces) {
			const [frontName, backName] = card.name.split(" // ");
			const [front, back] = [Object.assign({}, card), Object.assign({}, card)];
			front.name = frontName;
			back.name = backName;
			front.image_uris = card.card_faces[0].image_uris;
			back.image_uris = card.card_faces[1].image_uris;
			cards[count++] = front;
			cards[count++] = back;
		} else {
			cards[count++] = card;
		}
	}
	cards.length = count;

	// sorting by release date and then stable sorting by frame would be simpler but didn't work in practise and changed the order creating large diffs on cards.js
	for (let card of cards) {
		if (indexBase[card.name]) {
			if (card.released_at < indexBase[card.name].first_release) {
				indexBase[card.name].first_release = card.released_at;
			}
			// prefer first printing
			// exception: new printing has older frame
			if (
				parseInt(indexBase[card.name].frame) < parseInt(card.frame) ||
				(parseInt(indexBase[card.name].frame) == parseInt(card.frame) && indexBase[card.name].released_at < card.released_at)
			) {
				continue;
			}
		}
		const uris = card.image_uris;
		if (!uris) {
			console.error("No images for card " + card.name + " " + card.uri);
			continue;
		}
		let first_release = card.released_at;
		if (indexBase[card.name] && indexBase[card.name].first_release < first_release) {
			first_release = indexBase[card.name].first_release;
		}
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
			toughness: card.toughness,
		};
	}
	const index = {}; // [] does not work with associative arrays with stringify
	let index2 = {};
	for (let key in indexBase) {
		index[key] = indexBase[key].url;
		const ib = indexBase[key];
		index2[key] = {
			img: ib.url,
			date: ib.first_release,
			colors: ib.colors,
			mana_cost: ib.mana_cost,
			cmc: ib.cmc,
			type_line: ib.type_line,
			color_identity: ib.color_identity,
			power: ib.power,
			toughness: ib.toughness,
		};
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
}

createIndex();
