/**
 * Proposed copy edits for one review round.
 *
 * Everything here is a suggestion. build.mjs turns it into review/proposals.json and the
 * copy-desk page; apply.mjs writes only the suggestions Alex accepted back into content/.
 *
 * Anchors: `old` (or `from`, or `startsWith`) must match a line in the content file.
 * build.mjs folds curly quotes when matching and fails loudly on a missing or ambiguous
 * anchor, so a stale anchor can never silently apply to the wrong line.
 */

export const STYLE_GUIDE = [
  {
    title: 'Titles are lowercase. Acronyms stay uppercase.',
    body: 'Twenty-four of the forty-four titles are already lowercase, and so is the nav. ' +
      'Acronyms keep their caps (ATLAS, ITLL, RGB, MSLA, CSS, UI, VR, 3D). A brand whose casing ' +
      'is part of the name keeps it (OpenAI, ImageGen, FCView, B-Dubs). Everything else is ' +
      'lowercase, including brand names like ellumen and glowforge, because that is how you ' +
      'already write them.',
    alt: 'The alternative is Title Case everywhere, which is what the two newest pages do. ' +
      'The tool has lowercase applied. Reject the whole batch if you would rather go the ' +
      'other way and I will regenerate it.',
  },
  {
    title: 'Sections are concept, process, results.',
    body: 'Lowercase, in that order. Twenty-five pages already use these labels; the rest use ' +
      'variants (result, outcome, RESULTS, Concept). "reception" and "extensions" are fine as an ' +
      'optional fourth section when there is something to say.',
    alt: 'Pages under about 120 words get no section headings. One or two paragraphs read ' +
      'better than three one-line sections.',
  },
  {
    title: 'Sub-headings are sentence case and do not end in a colon.',
    body: 'These are content-specific ("Week 5: 2/4 -> 2/11", "1. Optimizations for less ' +
      'powerful computers"), so they keep proper nouns and their own wording.',
  },
  {
    title: 'First person, past tense, the way you talk.',
    body: '"We" stays where it was a team. Two pages (openai-case, bww-goggles) are written like ' +
      'resume bullets with no subject; they are rewritten to match the rest. Jokes, ellipses, ' +
      'exclamation marks and asides all stay. The goal is consistent shape, not a sanded-off ' +
      'voice.',
  },
  {
    title: 'Open with what it is.',
    body: 'The first sentence of concept says what the thing is in plain words before any ' +
      'backstory. Most pages already do this; a few start on the anecdote.',
  },
  {
    title: 'Mechanics.',
    body: "Typos and doubled words fixed. its/it's. Moon capitalized as a place. \"spray paint\", " +
      'not "spray-paint". Straight apostrophes inside any paragraph that gets rewritten, so a ' +
      'paragraph does not mix both kinds.',
  },
  {
    title: 'Deliberately left alone this round.',
    body: 'Captions (30% of images have one, unevenly; that is its own pass). The about page ' +
      "beyond one apostrophe. The devlog's week-by-week journal structure. Image order.",
  },
]

/** slug -> new title. Only titles the rule actually changes. */
export const TITLES = {
  'openai-case': 'OpenAI ImageGen camera case',
  'bww-goggles': 'B-Dubs vision goggles',
  'borzoi-vacuum': 'borzoi vacuum',
  'wiggle': 'wigglegram lens',
  'vr-training': 'ellumen: VR training',
  'christmas-ornament-2019': 'christmas ornament 2019',
  'severance-vr': 'severance VR',
  'lor-axe-vr': 'lor-axe VR',
  'glowforge-3d-demo': 'glowforge 3D demo',
  'replica-nunchucks': 'replica nunchucks',
  'ui-ux-for-openly': 'UI for openly.one',
  'music-video-wout-music-lematires-closer': 'music video w/out music',
  'expressive-booklet': 'expressive booklet',
  'fiske-planetarium-gravity-demonstration': 'fiske gravity demonstration',
  'page-crunch': 'page crunch',
  'sand-clock': 'sandy clock',
  'camera-viewfinder': 'camera viewfinder',
  'css-zen-garden': 'CSS zen garden',
  'photogrammetry-tests': 'photogrammetry tests',
}

/** `##` headings are normalised by rule in build.mjs; these are the `###` and odd ones. */
export const HEADINGS = [
  { slug: 'photogrammetry-tests',
    from: '### 1. Worst-Case Test: bad quality camera, dim lighting, Few Source Photos ( Reality Capture )',
    to: '### 1. Worst-case test: bad camera, dim lighting, few source photos (Reality Capture)',
    why: 'sentence case, tighter' },
  { slug: 'photogrammetry-tests',
    from: '### 2. Nose REference for Ghenghis Khan Costume',
    to: '### 2. Nose reference for Genghis Khan costume', why: 'typos, sentence case' },
  { slug: 'photogrammetry-tests',
    from: '### 3. Ghenghis Khan COstume',
    to: '### 3. Genghis Khan costume', why: 'typos, sentence case' },
  { slug: 'glowforge-3d-demo', from: '### 4. Augmented Reality', to: '### 4. Augmented reality',
    why: 'sentence case' },
  { slug: 'fishcity-devlog', from: '### Elevator Pitch:', to: '### Elevator pitch',
    why: 'sentence case, no trailing colon' },
  { slug: 'fishcity-devlog', from: '### Description:', to: '### Description',
    why: 'no trailing colon' },
  { slug: 'lor-axe-vr', from: '### Assets created:', to: '### Assets created',
    why: 'no trailing colon' },
]

/** Substring fixes inside a line. The whole line is shown so the fix has context. */
export const TYPOS = [
  { slug: 'borzoi-vacuum', from: "it's long handle", to: 'its long handle', why: "its/it's" },
  { slug: 'borzoi-vacuum', from: 'The TLDR; is that', to: 'The TL;DR is that', why: 'punctuation' },
  { slug: 'atlas-virtual-graduation', from: 'paid paid', to: 'paid', why: 'doubled word' },
  { slug: 'atlas-virtual-graduation', from: 'for to project', to: 'to project', why: 'stray word' },
  { slug: 'chartreuse', from: 'the the', to: 'the', why: 'doubled word' },
  { slug: 'fishcity-devlog', from: 'delunay', to: 'delaunay', why: 'spelling (d3-delaunay)' },
  { slug: 'fishcity-devlog', from: 'delauany', to: 'delaunay', why: 'spelling' },
  { slug: 'fishcity-devlog', from: 'Delauany', to: 'Delaunay', why: 'spelling' },
  { slug: 'fishcity-devlog', from: 'in in the photo', to: 'in the photo', why: 'doubled word' },
  { slug: 'fishcity-devlog', from: 'the the', to: 'the', why: 'doubled word' },
  { slug: 'fishcityco', from: 'delunay', to: 'delaunay', why: 'spelling' },
  { slug: 'fishcityco', from: 'a a', to: 'a', why: 'doubled word' },
  { slug: 'severance-vr', from: 'as-yet-unnanounced', to: 'as-yet-unannounced', why: 'spelling' },
  { slug: 'severance-vr', from: 'set our to make', to: 'set out to make', why: 'typo' },
  { slug: 'office-sign', from: 'for instalation', to: 'for installation', why: 'spelling' },
  { slug: 'about', from: 'Lets talk?', to: "Let's talk?", why: 'apostrophe' },
]

/** Structural: a line that should become a heading, or a merged line that should split. */
export const STRUCTURE = [
  { slug: 'borzoi-vacuum', old: 'process', new: '## process',
    why: 'this is a section label sitting in the body as a one-word paragraph' },
  { slug: 'borzoi-vacuum', old: 'results', new: '## results',
    why: 'same: a section label rendered as body text' },
  { slug: 'fishcity-devlog', old: 'Week 6: 2/11 -> 2/18', new: '### Week 6: 2/11 -> 2/18',
    why: 'every other week is a sub-heading; this one is plain text' },
  { slug: 'fishcity-devlog', old: 'Week 3: 1/21 -> 1/28', new: '### Week 3: 1/21 -> 1/28',
    why: 'this week label was styled as body text; the other weeks are sub-headings' },
]

/** Whole-paragraph rewrites. `old` is the exact current line. */
export const PROSE = [
  // ---- openai-case: resume voice -> first person; 85 words, so no section headings
  { slug: 'openai-case', old: '## overview', new: '',
    why: 'under 120 words: no section heading' },
  { slug: 'openai-case',
    old: "Designed the 3D-printed enclosure for OpenAI’s open-source build-it-yourself AI camera. Engineered a case that prints completely flat with zero support material and folds around the pre-assembled electronics using only the four screws that ship with the parts; print-in-place mechanisms and a smooth-bed outer finish and custom designed snap-together assembly make it robust and barely recognizable as a 3D print. My case files ship in OpenAI’s [public repository](https://github.com/openai/imagegencam/tree/main).",
    new: "OpenAI released an open-source, build-it-yourself AI camera, and I designed the 3D-printed enclosure for it. My case files ship in their [public repository](https://github.com/openai/imagegencam/tree/main).\n\nThe case prints completely flat with no support material, then folds around the pre-assembled electronics. It closes with the four screws that already ship with the parts and nothing else. Print-in-place mechanisms, a smooth-bed outer finish and snap-together assembly make it sturdy and hard to recognize as a 3D print.",
    why: 'voice: this was the only page written like a resume bullet, with no subject. Same facts, first person, split into what it is and how it works' },

  // ---- bww-goggles: same treatment
  { slug: 'bww-goggles', old: '## overview', new: '',
    why: 'under 120 words: no section heading' },
  { slug: 'bww-goggles',
    old: 'Designed 3D-printed parts for a national March Madness campaign novelty. Designed and tested an adjustable mounting system that attaches a mix of salvaged mirrors securely yet with play for use. Also designed a lightweight printable clamshell mirror with a molded-in BWW logo after off-the-shelf ones proved too heavy. BWW wanted to make a few dozen pairs of these for sale so I had to engineer every part for minimal print, build and post-processing time.',
    new: "BWW ran a national March Madness campaign around a novelty pair of goggles, and I designed the 3D-printed parts for them.\n\nThe mount had to hold a mix of salvaged mirrors securely while still letting them adjust, so I designed and tested it with a little play on purpose. Off-the-shelf mirrors turned out too heavy, so I also designed a lightweight printable clamshell mirror with the BWW logo molded in. BWW wanted a few dozen pairs to sell, which meant every part had to be quick to print, assemble and finish.",
    why: 'voice: resume bullets to first person. "Designed" opened three sentences in a row' },

  // ---- apollo-print: 162 words with three clear paragraphs; add the house sections
  { slug: 'apollo-print',
    old: 'Model of one of the first footprints on the moon for Fiske Planetariums celebration of the 50th Anniversary of the moon landing. Based off a model made from a [simple photogrametry scan](https://www.myminifactory.com/object/3d-print-one-small-step-30746)of the boot-print. I used a CNC to create a life-size replica out of foam, spray-paint and gravel.',
    new: "## concept\n\nA model of one of the first footprints on the Moon, made for Fiske Planetarium's celebration of the 50th anniversary of the landing. I started from a [photogrammetry scan](https://www.myminifactory.com/object/3d-print-one-small-step-30746) of the boot print and used a CNC to carve a life-size replica out of foam, then finished it with spray paint and gravel.",
    why: 'add the concept heading; fix "photogrametry", "Planetariums", the missing space before "of", and the sentence with no subject' },
  { slug: 'apollo-print',
    old: 'Started by \\*attempting to\\* laser cut the initial blocks out of foam before ultimately cutting the blocks with a hobby knife and using spray adhesive to make a stock block. From this, an Inventables X-Carve roughed out the print before I sanded over all the edges.',
    new: "## process\n\nI started by *attempting to* laser cut the blocks out of foam, then gave up and cut them with a hobby knife and glued them into one stock block with spray adhesive. An Inventables X-Carve roughed out the print from there, and I sanded the edges smooth.",
    why: 'add the process heading; your *attempting to* was showing literal asterisks on the site, this makes it real italics' },
  { slug: 'apollo-print',
    old: 'A coat of primer ate away at the foam some, but left a granulated texture that actually contributed to the final look. A few more coats of primer, spray adhesive, a sprinkling of gravel and more spray-paint and I had a model of one of the first steps on the Moon!',
    new: "## results\n\nA coat of primer ate away at the foam a little, but the granulated texture it left behind ended up adding to the final look. A few more coats of primer, spray adhesive, a sprinkling of gravel and more spray paint, and I had a model of one of the first steps on the Moon!",
    why: 'add the results heading; light punctuation' },

  // ---- sand-clock: 61 words, one paragraph, stays that way
  { slug: 'sand-clock',
    old: 'This project was my answer to an assignment to prototype a new experience with time. The idea came from those clocks where the colon separating the hours and minutes blinks to count off seconds. I meshed the idea with that of a traditional hourglass and had the blinked colons become grains of sand, adding to a pile that grows over time.',
    new: 'This was my answer to an assignment to prototype a new experience of time. The idea came from clocks where the colon between the hours and minutes blinks off the seconds. I crossed that with an hourglass, so each blink of the colon drops a grain of sand onto a pile that grows over time.',
    why: 'tighter; the last sentence had three ideas stacked on one verb' },
]

/** The pages seeded with prose rewrites this round, for the report. */
export const SAMPLE_PAGES = ['openai-case', 'bww-goggles', 'apollo-print', 'borzoi-vacuum', 'sand-clock', 'about']
