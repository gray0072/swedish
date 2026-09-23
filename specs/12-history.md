# 12. Historical theme — Vikings and the story of Sweden and Stockholm

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [12-history_ru.md](12-history_ru.md) and must be kept in sync.

## 12.1 Why history carries the game

The city builder is the reward loop, and it is built on **real** history — so the reward
teaches as well. Every era is anchored to actual events and every building to a real place.
A learner who finishes the game knows Stockholm, not just a fantasy town.

## 12.2 Honest framing

Stockholm is first mentioned in writing in **1252**. Eras 1–2 are therefore *not* Stockholm —
they are the Mälaren region that became it, with Birka roughly 30 km west on Björkö. Say this
plainly in the era intro instead of pretending there were Vikings in Gamla Stan. The shoreline
on the map stays the same throughout; the city itself arrives in era 3.

## 12.3 Era anchors (verified facts, used in era cards and content)

**Era 1 — Bosättningen (prehistory)**
- The first settlers follow the retreating ice, roughly 12 000 BC.
- Bronze Age rock carvings (*hällristningar*) at Tanum — UNESCO World Heritage.
- *Ales stenar* in Skåne — a stone ship of 59 boulders, roughly 600 AD.
- Buildings: hut, campfire, rock carving, stone ship, hunting ground.

**Era 2 — Vikingatiden, c. 750–1050**
- **Birka** on Björkö in Lake Mälaren, c. 750–975 — one of Scandinavia's earliest towns;
  UNESCO World Heritage together with Hovgården.
- Ansgar's Christian mission reaches Birka around 830.
- Uppland alone holds roughly **2 500 rune stones** — the densest concentration in the world.
- Swedes travelled **east**: the Baltic, the rivers of the Rus', and Miklagård (Constantinople).
  Ingvar the Far-Travelled's expedition, c. 1040, is commemorated on some 25 rune stones.
- The script is **Younger Futhark**, 16 runes.
- *"Viking" was something you did* — a raiding and trading voyage — not a people. The people
  were Norse, Svear and Götar. The era card says this explicitly.
- Buildings: longhouse, harbour with a *långskepp*, rune stone, Birka trading square, smithy,
  *ting* assembly place.

**Era 3 — Medeltiden, from 1252**
- Stockholm first appears in the written record in **1252**, in letters connected to Birger Jarl.
- **Storkyrkan**, 13th century — the city's cathedral.
- **Riddarholmskyrkan**, a Greyfriars monastery church from the 1270s–80s — royal burial church.
- *Mårten Trotzigs gränd* — 90 cm at its narrowest, the slimmest alley in Gamla Stan.
- *Stockholms blodbad* — the Stockholm Bloodbath, November 1520.
- Buildings: city wall, Storkyrkan, Stortorget market, harbour crane, guildhall, Riddarholmen.

**Era 4 — Stormaktstiden, 1611–1721**
- **Vasa** capsized on her maiden voyage on **10 August 1628**, barely 1 300 m from the shipyard.
  Salvaged in **1961**; Vasamuseet opened in **1990** and is the most visited museum in Scandinavia.
- The Tre Kronor castle burned in **1697**; the present **Kungliga slottet** was completed in 1754.
- **Riddarhuset**, the House of Nobility, 1660s.
- Buildings: shipyard, the Vasa herself, Riddarhuset, royal palace, observatory, tar harbour.

**Era 5 — Industrialismen, 1800s**
- **Stockholm Central Station**, 1871.
- **Skansen**, 1891, founded by Artur Hazelius on Djurgården — the world's first open-air museum.
- The **Nobel Prize** is first awarded in 1901.
- **Stadshuset**, 1923, by Ragnar Östberg — the Nobel banquet is held in *Blå hallen*,
  the Blue Hall, which is famously not blue.
- Buildings: central station, gasworks, Skansen, Stadshuset, tram line, Nobel hall.

**Era 6 — Moderna Stockholm**
- The **tunnelbana** opened in 1950; around 90 of its 100 stations are decorated, which is why
  it is called *the world's longest art gallery*.
- **Globen**, 1989, renamed **Avicii Arena** in 2021.
- **ABBA** won Eurovision in 1974 with *Waterloo*; ABBA The Museum opened in 2013.
- **Slussen** rebuilt; the Gold Bridge was lifted into place in 2020.
- Buildings: an art metro station, Avicii Arena, Vasa Museum, ABBA Museum, Slussen, Fotografiska.

## 12.4 History cards — `content/history/`

A new lightweight content type: **not a lesson** — no quiz, no XP gate, no pass score.
120–200 words, a date, an illustration, and 5–8 Swedish key words.

```jsonc
{
  "id": "birka",
  "era": "viking",
  "unlockedBy": "trading-square",       // building id
  "title": { "sv": "Birka", "ru": "Бирка", "en": "Birka" },
  "date": { "from": 750, "to": 975 },
  "body": { "ru": "…", "en": "…" },
  "vocab": ["handel", "skepp", "silver", "resa", "hamn"],
  "image": "/img/history/birka.svg",
  "sources": ["UNESCO World Heritage List, Birka and Hovgården", "Riksantikvarieämbetet"]
}
```

Reading a card grants a small one-time coin reward, and **its vocabulary enters the SRS deck** —
so the history the learner reads for fun quietly becomes language practice they will be
re-tested on. This is the cheapest, most elegant bridge between the game and the learning.

## 12.5 Themed lesson packs unlocked by buildings

**Status: planned, not shipped.** The packs below are not authored yet, so no building claims
to unlock one — see §8.4 rule 1. When they are written, a pack file carries its own
`unlockedBy: <buildingId>`, exactly like a history card (§12.4), and the building's perk stays a
number. The buildings that once advertised these packs now grant review capacity, retries,
hints and XP instead.

Planned packs:

| Building | Pack | Content |
|---|---|---|
| Rune stone | `viking-words` | `skepp`, `hamn`, `handel`, `resa`, `sten`, `rista`, `minne`, plus how rune stone inscriptions are phrased: *"X lät resa stenen efter Y"* |
| Storkyrkan | `gamla-stan` | Navigating the old town: `gränd`, `torg`, `kyrka`, `slott`, `bro`, directions |
| Vasa | `vasa-ship` | Ship and museum vocabulary, plus the wreck's story in simple Swedish |
| Metro station | `tunnelbanan` | Station names, directions, tickets, real announcements: *"Nästa station …"*, *"Dörrarna stängs"* — immediately useful to anyone living in Stockholm |
| Skansen | `svensk-kultur` | `fika`, `midsommar`, `lucia`, `allemansrätten`, `lagom` |
| Climate lab | `hallbar-svenska` | `miljö`, `klimat`, `hållbar`, `återvinning`, `sopsortering` — the vocabulary of Swedish environmental debate, which is everywhere in the news |
| Language lab | `framtidssvenska` | Loanwords, abbreviations and the Swedish of digital life: `uppkopplad`, `nedladdning`, `skärm`, `konto` |
| Language archive | `havets-ord` | `hav`, `våg`, `is`, `storm`, `översvämning`, `nivå` — water and weather |
| Space school | `rymdsvenska` | `rymd`, `stjärna`, `bana`, `avstånd`, `framtid` — plus numbers at a scale SFI never reaches |

Packs are **bonus** content. The core curriculum is never gated behind the game.

## 12.6 Historical accuracy rules

- Every historical claim carries a date, and dates are checked before commit.
- `sources` is **required** on every history card.
- **Myths we explicitly refuse:** horned helmets; "Vikings" as a nation or race; Elder Futhark
  in a Viking-Age context; and "Birger Jarl founded Stockholm in 1252" — 1252 is the first
  written *mention*, the founding was gradual, and the attribution to Birger Jarl is
  traditional rather than documented. Write "first mentioned", not "founded".
- *Jantelagen* comes from Aksel Sandemose's 1933 novel and is Dano-Norwegian in origin, even
  though it is routinely applied to Sweden. If a culture card uses it, it says so.
- Uncertain claims get a hedge — "traditionally", "according to the sagas" — rather than
  deletion. The app should model honest history, not tidy history.
- Do not romanticise raiding. The era was trade, craft, travel and settlement as much as
  violence — which is both better taste and better history.

## 12.7 Seasonal skins tied to the real calendar

| Date | Event | Treatment |
|---|---|---|
| 13 December | **Lucia** | Candles across the city, deep blue night palette, `lussekatt` icon |
| June | **Midsommar** | A *midsommarstång* on the map, birch garlands, flower crowns |
| 4 October | **Kanelbullens dag** | Cinnamon bun icon, a fika coin bonus |
| 6 June | **Nationaldagen** | Flags — the one day of the year flag blue and yellow take over the UI |
| Advent | **Advent** | *Adventsstjärna* star lamps in the windows of every building |

Each event ships one small limited-time lesson. Cheap to author, strong reason to return.

## 12.8 The four future eras are speculation, and say so

Eras 7–10 (`green`, `connected`, `floating`, `stellar`) are not history and must never be
dressed as history. The rules that keep them honest:

- Each carries `"speculative": true` in `eras.json`, and the City page renders a standing
  disclaimer above any era that has it: *"These four eras are guesswork, not history."*
- **No history cards.** `content/history/` requires a `sources` array (§12.4) and there are no
  sources for a city that has not been built. A future era gets flavour text, not citations.
- Where a building extrapolates from something real, the description names the real thing and
  the year — "the Stockholm Wood City project announced for Sickla in 2023" — and then says the
  outcome is unknown. Where it is invented, it says that too: the aurora beacon's description is
  *"pure invention — though the aurora over Sweden is real enough."*
- Real facts that survive into the future stay accurate: the Nobel Prize has been awarded since
  1901, the land under Stockholm still rises about 4 mm a year. The speculation is about what
  gets built, never about what happened.
- No dates presented as predictions. The era names carry a decade as a mood ("2030s"), not a
  forecast, and nothing in the app claims Stockholm *will* look like this.

The progression is deliberate: green → connected → floating → stellar escalates from "announced
and under construction" to "openly science fiction", so the further the learner goes, the more
obviously it is a game. The learning does not change — the last building in the city is a school,
and its flavour text is the campfire's line from era 1: *"Vi lär oss fortfarande tillsammans."*
