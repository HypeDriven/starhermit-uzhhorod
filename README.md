# Uzhhorod — The River Remembers

A complete single-player historical puzzle game built on **StarHermit Engine 1.38.0**. Walk an animated 3D miniature of Uzhhorod, Ukraine; solve four distinct restoration challenges; reconstruct the historical evidence; find six small stories; help three fictional residents; complete an evolving letter; dedicate a procession of river lights.

## License

The first-party game code, original game assets, tests and documentation in this repository are offered under the same terms as StarHermit Engine: **PolyForm Noncommercial License 1.0.0**, including Hype Driven Development Inc.’s additional permission for commercial use to make, distribute and run games while they are published on StarHermit.com, publicly playable there and kept in running order there. See [LICENSE](LICENSE) for the complete terms and required notice, reproduced verbatim from the engine’s license (upstream blob `5067a5b6c77e2133865a3a14ab700b05acdfcb54`).

The same notice is included in `game/LICENSE` and `dist/LICENSE`. The engine runtime is downloaded from its official pinned distribution and is not included in this repository; its third-party components retain their own licenses. Historical research links identify the sources of the factual summaries and do not license those external sites’ text or images.

## Play

Tap a glowing landmark (or press 1–4). A lantern-keeper follows the streets to it, using the pedestrian bridge when crossing the Uzh. Tap a street to walk there yourself. Each landmark first offers a distinct fictional restoration mechanism, then three historical fragments to order. The living promenade orders seasons instead of dates. Tap selected fragments to remove them. Field notes and guides are available without penalties.

Drag to orbit. Left/Right also orbit. WASD walks along the street graph; A/D steers the river boat. +/− or the wheel zoom. Enter confirms. Z/X/C select the three evidence cards or light rings, and Z/X/C/V play four musical notes. In the root puzzle, arrows select channels and Enter turns one. J opens the journal; N shows puzzle notes; L toggles the memory lens; M toggles sound. All primary interactions work with touch. Drag directly on the river to steer. The View button hides the interface; tap anywhere to return. The season button changes spring, summer and autumn; the clock button (T) opens the town-day controls.

## Expanded gameplay

| Place | Restoration challenge |
| --- | --- |
| Castle | Rotate three concentric light rings until their marks meet the north light. |
| Synagogue / philharmonic | Repeat three musical phrases of three, four and five notes. Visual key flashes accompany the sound; replay and written guides are available. |
| Living promenade | Turn a 4×4 channel network until water reaches both tree roots. Illuminated channels show the connected water network. |
| Bridge / Uzh | Steer a paper boat through five pier openings, with current drift, retry checkpoints, touch steering and a calm-current option. |

These mechanisms are invented for the game. They do not claim that the castle contained a light-ring device, that the promenade had this irrigation layout, or that the musical phrase is historical.

The memory lens reveals six optional traces in the streets. Walk to them to collect a folded paper, brass key, postcard, leaf, concert programme and thread. Their short reflections distinguish fictional objects and imagined everyday lives from documented facts. Revisit collected stories through **Journal → Small stories**. All six unlock the “Keeper of Small Things” ending acknowledgement.

## The Unsent Letter

Three invented residents connect the discoveries to acts of care in the city. Their conversations and requests are fiction, clearly labelled in the dialogue, and do not purport to be historical testimony.

| Resident | Request | Consequence |
| --- | --- | --- |
| Marta, the bookbinder | Find the folded paper and postcard; solve a sliding postcard puzzle. | Unlock a memory compass that follows the shortest street route to the nearest unfound story, and read the evolving letter. |
| Olena, the gardener | Bring the linden leaf and restore the living promenade. | Choose a public garden with shade trees or a flowering bed; unlock faster walking. The planting choice can be changed later. |
| Danylo, the lamplighter | Visit three lamps on both banks and catch three timed sparks at each. | The repaired lamps glow and a string of lights illuminates the bridge after returning to him. A steady-hands option slows the mark and widens the timing window. |

**Map & requests** draws the actual game street graph, shows your location, and offers direct visits to the residents. Tap the map to choose a walk. The map preserves the selected request across sessions. **B** opens it; **5–7** visit Marta, Olena and Danylo. After Marta’s request, **F** uses the compass. The `Brisk walk` control toggles Olena’s walking reward.

Marta’s three-page letter reflects the six objects found, the chosen garden, repaired lamps and your final dedication. Empty parts acknowledge stories you have not found. It is original fictional writing, available through the map after her request. The postcard arrangement and each caught lamp spark are saved, so leaving an activity does not erase those checkpoints. These requests are optional alongside the original four memories, and older saves keep their previous progress.

After all four memories, choose a dedication for those before us, beside us, or after us. This changes the ending’s reflection and the river lights’ colour. Completed landmarks allow challenge replays. The journal pauses an active challenge. Progress is stored locally through StarHermit; older saves retain their restored memories, with the new side discoveries and challenges starting uncompleted.

## Heritage fieldwork and the gathering

**Fieldwork** (K) opens two clue-led heritage studies. Walk to each site, orbit the model, inspect its three highlighted details and keep the field notes. Notes and inspected details persist. **Save view PNG** uses the actual StarHermit scene capture API and the player’s download/file picker; the notes remain available if capture is unsupported or cancelled.

* **Shelestovo Church of Archangel Michael:** an expanded open-air museum area, with oak-coloured wall courses, stepped shingled roofs, three towers and a porch. Its study covers timber construction, its three-part silhouette, and its journey from Shelestovo to Mukachevo and then the museum. The museum dates construction to 1777, the first move to 1927 and installation in Uzhhorod to 1974. Sources: [the museum’s own exhibition guide](https://www.uzhhorod-skansen.com/en/%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%96%D1%88%D0%B5-%D0%BF%D1%80%D0%BE-%D0%B5%D0%BA%D1%81%D0%BF%D0%BE%D0%B7%D0%B8%D1%86%D1%96%D1%8E) and [regional council catalogue](https://zakarpat-rada.gov.ua/catalog/zakarpatskyj-muzej-narodnoyi-arhitektury-ta-pobutu/).
* **Holy Cross Cathedral:** a closer architectural study of the existing paired-tower model, with additional columns, arches, windows and approach steps. Municipal tourism dates the beginning of construction to 1640 and the former Jesuit complex’s transfer to the Greek Catholic eparchy to 1775. [Municipal source](https://travel.rada-uzhgorod.gov.ua/?p=599).

These are stylized architectural miniatures, not measured reconstructions. The museum sits beside and to the south-east of the castle in the compressed game geography. Its new approach joins the street graph without passing through the church. The river channel and bank geometry keep the water surface visible across the crossing.

Completing four memories, three residents’ requests, six stories and both studies unlocks **The Night of Many Voices**, an invented shared gathering. Its lantern-weaving puzzle joins three matching terminal pairs on a 5×5 board, fills every square and prevents crossed threads. Draw with touch or mouse, or select squares with arrows and Enter. Threads can be backtracked or cleared; an optional guide shows one valid thread at a time. Partial arrangements persist.

Finishing the weave brings the residents and townspeople along the streets toward the river, adds a procession of 64 river lights, and adds the gathering to the ending and letter. Interactions and map locations follow the residents to the banks. The original dedication ending remains available before this optional capstone.

## Replayable courier walks

**City walks** (G) offers varied, seeded three-stop delivery circuits. Choose the delivery order, plan while the walk is paused, and compare the distance walked with the shortest of all six stop orders. There is no time limit. Distances follow the actual street segments, including corners and the bridge. Completed walks and the best efficiency are stored locally; no competitive or external leaderboard is implied.

Delivery checkpoints and the keeper’s position persist. A reloaded circuit starts paused. The courier letters are fictional everyday-life vignettes. These walks can be played before or after the main story and gathering.

## A changing town day

The clock starts at 08:00. Each second of exploration advances two game minutes. Reading, planning, conversations and puzzles pause it; it can also be paused manually. **Town day** (T, or the time button) offers morning/night jumps, a three-hour skip, and immediate waiting for any event. Joining an event reserves its time while the keeper walks there, so a slow approach cannot cause you to miss admission. These are invented game schedules, not actual opening hours or live local weather.

| Game event | Activity | Lasting detail |
| --- | --- | --- |
| Morning market, 09:00–13:00 | Pack exactly four gifts, include apples, bread and flowers, and match the basket’s balance. The target changes across three day variants. | A basket appears with the keeper. Z/X/C add gifts; N clears the basket. |
| Reading circle, 14:00–17:00 | Arrange four fragments of an original sentence, then keep its first voice, invite another hand or leave a question. | The noticeboard and living letter reflect the chosen margin. Z/X/C/V select fragments; the choice can be revisited. |
| Evening recital, 18:00–21:00 | Play four short original phrases using the highlighted notes and amber timing band. Three good beats carry a phrase forward; unsuccessful phrases repeat. | A recital stamp joins the daybook, and the musicians also appear during the final gathering. Z/X/C/V play notes. |

Each activity awards one stamp per game day, with lifetime visit counts kept locally. All three stamps in the same day earn the **Daykeeper** acknowledgement. Repeats remain available without duplicate stamps. The recital’s **Unhurried mode** holds each timing mark until the correct note is played, with no time limit; this preference persists. Both the visual highlights and sound identify the next note.

Clear weather, rain and mist follow a deterministic game schedule or can be chosen manually. Sun angle, sky, window glow and exposure follow the clock. Rain adds instanced drops, umbrellas, puddles, wet paving and soft synthesized noise; walking becomes 10% slower and the paper-boat current grows stronger. Mist softens the distance and reduces the current slightly. Calm-current assistance remains available. Wet surfaces dry gradually after rain. Residents’ greetings acknowledge the time and weather.

## The Little Exhibition

Open **City Archive → Curate an exhibition** (I opens the archive). The keeper walks to a small pavilion behind the south-bank houses. A new paved approach runs around the eastern end of the houses and into its central aisle; it joins the same street graph used by the other walks.

The catalogue connects sixteen objects to existing progress: six found stories, four restored landmark source cards, both recorded architectural studies, a saved workshop boat, an Evening Company ribbon, a checked archive folio and an imagined starter map. Locked catalogue entries explain their leads and can take the keeper to the relevant activity. The folio unlocks after checking all three claims in any archive case. Nothing is consumed by exhibiting it.

Arrange four stands, optionally leaving a quiet bench. Select a stand and choose an object from the catalogue. Placing an object that is already shown swaps the stands and their captions. The visitor route runs A → B → D → C, or reverses to C → D → B → A. Neighbouring objects form a thematic link when they share routes, care, voices, making or time. A quiet space pauses that thread without breaking its thematic comparison.

Captions distinguish **Source summary**, **Game fiction** and **Player keepsake**. The catalogue explains the origin of each object. Found objects and the compressed game map are fiction; historical cards, field studies and the checked folio are source summaries; the boat and walk ribbon are player keepsakes. Source items link to their corresponding histories. These objects, pavilion, display replicas and visitor notes are authored game content, not recovered historical exhibits.

| Visitor brief | Curatorial challenge |
| --- | --- |
| Marta: A careful first page | Start with a source summary, include named fiction, and make two links along the route. |
| Olena: Room to linger | Leave a quiet space in the middle, include an evening ribbon and at least two objects about care, and use warm light. |
| Danylo: Hands and journeys | Place a saved boat next to the checked folio in the object sequence, include imagined making, and use study light with two links. |

Every arrangement needs at least three different collected objects and honest captions before it can open. **Preview visitor notes** explains each condition and offers the resident’s fictional reaction. A room can open before satisfying its optional brief; meeting the full brief adds its ribbon to the pavilion. Draft arrangements and the open arrangement are separate copies, so trying another version preserves the recorded open version. Three lighting schemes and reversible entry offer additional variations.

The **room view** uses a closer camera range, with drag orbit and wheel/+/− zoom. Four physical stands change between objects and quiet benches. Paper, a key, a leaf, thread, architectural studies, the actual saved boat design and a ribbon have distinct display forms. Three anonymous visitors follow the central aisle between stands once a room opens. Caption colours, point lights, canopy tint and earned ribbons update with the display.

In the editor, arrows select stands; **Enter** opens the catalogue; **Z** changes the caption, **X** the light, **C** the starting stand and **V** leaves a quiet space. Touch buttons provide the same actions. Arrangements, captions, open-version count and ribbons persist alongside all earlier progress. Exhibition versions and feedback are local game state, with no external publication or messaging.

## Evening Company

Open **City walks → Host an evening walk** (G opens City walks). Invite one or more residents you have met, then select three distinct stops in visiting order from the castle courtyard, music square, linden promenade, crossing, wooden church and cathedral approach. Tap a selected stop to remove it; adding it again puts it last. This is an invented hosted walk, with game planning minutes rather than real tour durations.

Choose a leisurely or brisk pace and a 45-, 60- or 75-minute planning budget. The estimate follows the actual street routes from the riverside meeting point and includes an allowance for shared moments. The walk begins in the game’s evening window. Guests walk from their current locations to meet the keeper on the south bank, then travel along graph edges to each stop. The keeper waits if the company is still approaching. Invited residents remain physically present while the walk is paused; their map destinations follow their positions. On finishing, they walk back toward home or the established gathering.

At each stop, choose one moment:

| Shared moment | Game minutes | Effect |
| --- | --- | --- |
| Tell the place | 6 | Reflect on the place and any memory or field study already restored. |
| Invite a voice | 8 | Hear a resident’s imagined reflection, including responses to completed requests. |
| A quiet pause | 7 | Restore the company’s comfort before the next leg. |

Switch between the invited residents to hear each reaction. **Z/X/C** choose the moment; **Enter** continues after a choice. The scene keeps the miniature visible between its header and conversation panel. **Field note** opens the existing source-based history with dates and links, separate from the fictional dialogue.

Travel uses measured keeper distance along the street graph. Brisk pace saves planning minutes but takes more comfort; rain adds travel cost and fatigue, while mist slightly increases travel time. Stories use some energy and pauses restore it. Reading menus and dialogue has no real-time cost. The clock advances by the walk’s travel and chosen moments rather than by time spent reading. There is no countdown or punitive failure: a late walk has a different reflection, and it can be ended early.

Completing a route earns a ribbon at the new south-bank bench. Further ribbons acknowledge finishing within budget with everyone comfortable, and trying all three kinds of shared moment. The report keeps the selected stops, moments and elapsed planning minutes. Completed walks and ribbons persist; new walks can use different company, order and pacing. A reloaded unfinished walk starts paused and can resume from its saved keeper/guest positions. Starting another travel activity pauses the walk. Existing courier circuits remain available and are paused when a hosted walk starts.

## The Riverside Workshop

Open **Town day → Riverside workshop**, or press **R**, to walk to the bench on the south bank. This optional craft-and-test loop uses invented requests and stylized game physics. It is not a reconstruction of a local lantern-making tradition. All lights float on the game river.

Meet a resident to unlock their workshop request. These deliveries are separate from their original story requests and do not gate the existing ending or gathering.

| Resident | Promise | Design tradeoff |
| --- | --- | --- |
| Marta | A steady light: at least 1.0 room, 1.8 steadiness, 90% condition, crossing within 18 seconds. | Ballast and width steady the boat, while excessive weight costs pace. |
| Olena | Room for seedlings: at least 2.5 room, 75% condition, crossing within 22 seconds. | A wide, lightly ballasted hull leaves space for the paper cargo. |
| Danylo | A light through gusts: at least 1.0 room, 1.4 steadiness, 85% condition, crossing within 12.5 seconds. | A taller sail adds speed and catches more wind; ballast can stabilize it. |

At the bench, cycle three hull widths, three sail heights and zero to two ballast pebbles. Stats update immediately. Choose amber, rose or river colours and wave, leaf or star motifs. Appearance choices do not change performance. **Z/X/C** cycle hull, sail and ballast, **V** changes colour and **N** changes the mark; all have touch controls. **Enter** launches a short water test.

The deterministic wind changes during the trial and is stronger in rain, softer in mist. **A/D**, trim buttons, or dragging the rudder mark counter its push. Bank contact and excessive roll reduce condition. **Rudder assist** handles course correction while leaving the design tradeoffs intact; **N** toggles it during a test. The journal pauses the trial, and the town clock pauses throughout workshop panels. No materials or currency are consumed. Retry or revise freely.

The result notebook plots the course, reports condition and room/steadiness, and offers a specific next change when a design misses its promise. Successful commissions become saved parcels. Walk back to the resident to deliver them; if a session ends on the way, the bench offers **Deliver the waiting lantern**. Delivered blueprints and a separately saved favourite appear among the actual 3D river lights, including the larger gathering. Repeating a commission can replace its blueprint. Free design and practice are available before meeting anyone.

The waterside bench has paper stacks, paint jars, brushes, an awning and a live prototype. River models now have folded hulls, sails, luminous paper lights, visible ballast and selected motifs. Designs, completed deliveries, pending parcels, local test counts, best condition and assistance preference persist alongside all previous progress. Tests in flight can be paused with the journal; a reloaded session starts a fresh trial.

## The City Archive

Open **Journal → City archive**, or press **I**, for a connected investigation alongside the restoration campaign. Twelve small reading stands are placed along reachable streets and museum approaches. Visit a stand to collect its authored source summary; collected cards can be reread without another walk. The stations and investigation are invented, and the cards are paraphrases of linked museum and municipal histories, never presented as recovered original documents.

| Case | Historical question | Evidence |
| --- | --- | --- |
| The crossing | What persists when a bridge is replaced? | Iron crossing, toll removal, city bus, destruction and later replacement. |
| A travelling church | Can a building belong to more than one place? | Shelestovo construction, the two recorded relocations, and the three-part plan. |
| Inside the castle | What does a date above an entrance actually date? | The palace, earlier fortification, seminary and museum. |

Each case has three claims. Link two collected summaries and choose **Supported**, **Contradicted** or **Not settled**. The nine arguments include chronological comparisons, mistaken identities, and claims that exceed what these sources establish. Supported and contradicted claims need a relevant evidence pair. For unresolved claims, any two collected summaries are accepted with the explanation of what is missing. Wrong choices offer recoverable feedback; an optional guide explains a valid connection. There is no score loss or timer. Research pauses the town clock.

Z/X/C/V toggle the four evidence cards. Left/Right change claims; Up/Down change the verdict; Enter checks; N toggles the guide. The same controls are available as touch buttons. Evidence links, verdict drafts, collected summaries and checked arguments persist. Completed arguments remain available for review.

Checking all nine claims unlocks a revisable interpretation: **A city of journeys**, **A city of changing rooms**, or **An unfinished archive**. It changes the ending’s prose, the final letter page, and the sculptural archive display near Marta’s stall. These are the keeper’s fictional reflections. The source-based answers remain the same whichever interpretation is chosen. The original story, gathering and dedication remain available without this optional investigation.

The bridge and castle cases use the municipal and local-history museum pages listed below. The church case uses the open-air museum’s own exhibition guide. The added earlier-fortification clue comes from the castle museum’s history, which distinguishes the tenth-century fortified settlement from the palace’s 1598 date.

## Build and run

Download the official Linux/Windows/macOS engine 1.38.0 using the release API described at https://wiki.starhermit.com/docs/tutorials/starhermit-engine.html and verify its published hashes.

```sh
starhermit game
starhermit check game
starhermit package --web game --out dist
python3 scripts/finish-web.py
node tests/gameplay.mjs
node tests/townlife.mjs
node tests/investigation.mjs
node tests/workshop.mjs
node tests/eveningwalk.mjs
node tests/exhibition.mjs
```

The `game/` folder is the editable native script package. `dist/` is the generated web upload with the required `starhermit.txt`, actual engine loader and file integrity index. No replacement renderer or browser imitation is used. The engine is loaded from its official pinned distribution, rather than bundled. Browser play requires HTTPS or localhost and a browser supported by StarHermit. Source links additionally need platform approval when hosted as a registered StarHermit game; a separate `sources.html` accompanies the web package so sources remain readable without platform registration.

## Historical basis

The town model is an artistic miniature, with compressed distances and stylized buildings. It does not represent a single historical year. The magic, memory-keeper narrative and river-light ritual are fictional.

* **Castle:** palace date 1598; Union of Uzhhorod, 24 April 1646; regional museum moves into the castle in 1947. [Transcarpathian Museum of Local History](https://www.zkmuseum.com/p/uzhhorod-castle-history.html).
* **Synagogue:** opened in 1904; philharmonic occupies the building from 1957; three-manual, 2,250-pipe organ installed in 1974. [Municipal tourism](https://travel.rada-uzhgorod.gov.ua/?p=622) and [organ details](https://travel.rada-uzhgorod.gov.ua/?p=1674).
* **Jewish history:** Holocaust context is presented as remembrance, not a puzzle. [YIVO Encyclopedia: Uzhhorod](https://encyclopedia.yivo.org/article.aspx/Uzhhorod); [USHMM: Anna Lax Patipa oral history context](https://encyclopedia.ushmm.org/content/en/article/selections-of-jews-upon-arrival-at-auschwitz).
* **Linden promenade:** planted 1928; about 2.2 km. [Municipal tourism](https://travel.rada-uzhgorod.gov.ua/?p=636). Ornamental cherry trees reported brought from Vienna in 1923: [Visit Uzhhorod](https://visit-uzhhorod.itc.gov.ua/2022/11/17/strong-do-uzhgoroda-na-sakury-strong/). The autumn card describes the seasonal cycle, not a historical event.
* **Crossing:** predecessor iron bridge opened 1898; toll abolished 30 September 1907; city bus crossed in 1921; bridge destroyed by retreating German forces in 1944. The model depicts a stylized later pedestrian bridge. [Municipal tourism](https://travel.rada-uzhgorod.gov.ua/?p=640).

The city’s diverse past includes Ukrainian, Rusyn, Hungarian, Jewish, Slovak, Czech, Roma and other communities. Four memories are an introduction, not a complete history.

## Rendering

Retained 3D scene; shared geometry and materials; GPU-instanced drifting petals and 1,400 paving stones; a walking lantern-keeper and route lights; twelve pedestrians and three residents; a gathering that follows street routes to both banks; circling birds and four wandering cats; a bookbinder’s stall with books, paper stacks and an awning; café tables, chairs, planters, signs and flags; a garden that changes with your choice; independently repaired lamps and bridge garlands; moving river glints and up to 64 river lights; a new timber church and museum enclosure; expanded cathedral detail; restoration light shafts; shadow mapping; ambient occlusion; restrained bloom; seasonal tree palettes; warm light against teal dusk; synthesized river ambience and a quiet harmonic soundscape.

## Validation

StarHermit headless runtime check (120 frames), TypeScript strict check, and deterministic tests of the actual game state machine and shared mechanics. Run `node tests/story.mjs`, `node tests/fieldwork.mjs` and `node tests/courier.mjs` for the campaigns, heritage/gathering and replayable walks (each includes the base gameplay suite). Coverage includes street routes, river crossings, all challenges, retry and guide behavior, historical evidence, discoveries, dedication, older-save migration, journal pausing, touch controls, solvable postcard arrangements, request dependencies, partial checkpoints, compass routing, reversible gardens, the living letter, heritage visits, note recording, capture success/failure handling, valid non-crossing light paths, gathering prerequisites and responsive controls. Courier route budgets and walked distances are checked against independently calculated all-pairs shortest paths.

Town-day checks cover day rollover, paused time, event reservations and waiting, repeat stamps, all basket variants, reading choices, recital retry/timing and assistance, complete three-event progression, saved keepsakes, and weather-dependent current. An additional temporary native-engine fixture exercises the rainy gathering and all four new panels, and completes the recital logic inside StarHermit’s interpreter.

Archive checks walk to all twelve stations and resolve all nine arguments through the actual state machine. They cover wrong verdicts and evidence pairs, partial drafts, saved accounts, revision, invalid/older saves, optional-story compatibility, paused research, keyboard, touch and responsive panels. A temporary native fixture also exercises the archive panels, three display variants, and evidence assessment inside StarHermit.

Workshop checks verify distinct viable designs for all three requests across clear weather, rain, mist and six gust patterns; compare 30/60 Hz outcomes; cover capacity, steadiness, speed and damage failures; and complete bench visits, resident meetings, paused trials and all three deliveries through the actual state machine. They also check saved parcels, favourite copies, keyboard, touch rudder, older saves and responsive panels. A temporary native fixture runs all commissions in every weather, validates saves, and exercises the five workshop panels with the custom 3D fleet.

Evening Company checks complete a three-stop route with all guests and compare charged travel against an independent all-pairs shortest-path calculation. They cover invitations, route ordering, bounded guest movement, one-time choices, journal pausing, historical note access, ribbons, ending after the final conversation, interrupted/reloaded legs, older saves and responsive panels. A native fixture exercises walk assessment, save restoration, the four new panels, guest placement and return paths.

Exhibition checks solve all three briefs through the actual input/state flow and verify provenance guards, collected-object gates, route connections, a quiet space, swapped captions, object leads, draft/open separation, saves, older progress, touch and panel bounds. The base route suite also covers the added pavilion approach. A temporary native fixture validates all briefs and saves, exercises the six new panels, and cycles through all display forms, lighting and route variants.

Overlay panels were inspected in desktop and portrait render approximations. Full browser visual verification remains blocked by the private site’s sign-in gate; the internal HTTP preview is refused by StarHermit, and this container lacks a native GPU backend for offscreen rendering. Actual PNG capture, the 3D gathering, workshop fleet, hosted walks, exhibition and weather therefore remain unverified on a live GPU, while their control and failure paths are covered.

## Production publication

The Starhermit production title is **Uzhhorod**. The game manifest declares `cover=cover.jpg` and `description.file=description.md`; the generated loader uses `favicon.svg`. Cover-generation details are in [ARTWORK.md](ARTWORK.md).

Rebuild the web package with `starhermit package --web game --out dist`, then run `python3 scripts/finish-web.py` to add page metadata and refresh the file integrity index. `publication.json` is an ignored local deployment receipt.
