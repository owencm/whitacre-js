'use strict';

const MA = 0, MI = 1;

const key = { root: 3, type: MA }

const random = (from, to) => {
  return from + Math.floor(Math.random() * (to - from + 1));
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const maScale = [0, 2, 4, 5, 7, 9, 11];
const miScale = [0, 2, 3, 5, 7, 8, 10, 11];
// const preferredNotes = [0, =]

const maChord = [0, 4, 7];
const miChord = [0, 3, 7];

const whitacreMaCRs = [
  { from: MA, to: MA, rel: 5 },
  { from: MA, to: MA, rel: 2 },
  { from: MA, to: MI, rel: -2 },
  { from: MA, to: MI, rel: -1 },
  { from: MA, to: MI, rel: 4 },
  { from: MA, to: MI, rel: -2 },
  { from: MA, to: MI, rel: -3 },
];

const whitacreMiCRs = [
  { from: MI, to: MI, rel: -2 },
  { from: MI, to: MA, rel: 1 },
  { from: MI, to: MA, rel: -2 },
  { from: MI, to: MI, rel: 7 },
];

const debussyMaCRs = [
  { from: MA, to: MI, rel: 4 },
]

const debussyMiCRs = [
  { from: MI, to: MI, rel: 3 },
]

// const maCRs = [].concat(whitacreMaCRs, debussyMaCRs);
// const miCRs = [].concat(whitacreMiCRs, debussyMiCRs);

const maCRs = whitacreMaCRs;
const miCRs = whitacreMiCRs;

const addNotes = (root, rel) => {
   return (root + rel + 12) % 12;
}

const isNoteInKey = (note, key) => {
  const notesInKey = (key.type === MA ? maScale : miScale).map(
    (note) => addNotes(key.root, note)
  );
  return notesInKey.indexOf(note) > -1;
}

const areNotesInKey = (notes, key) => {
  return notes.map((note) => isNoteInKey(note, key)).reduce((a, b) => a && b);
}

const isChordInKey = (chord, key) => {
  const chordNotes = (chord.type === MA ? maChord : miChord).map((note) =>
    addNotes(note, chord.root)
  );
  return areNotesInKey(chordNotes, key);
}

isChordInKey({root: 0, type: MA}, {root: 0, type: MA});

const getFormattedChord = (chord, key) => {
  const root = chord.root;
  const type = chord.type;
  // TODO: Keys
  const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  return noteNames[root] + (type === MI ? 'm' : '');
}

const getRandomChordInKey = (key) => {
  let chords = [];
  for (let root = 0; root < 12; root++) {
    const potentialChords = [{root: root, type: MA}, {root: root, type: MI}];
    chords = chords.concat(potentialChords.filter((chord) => isChordInKey(chord, key)));
  }
  return chords[random(0, chords.length-1)];
}

const generateProgression = (key, bars) => {
  let startingChord = getRandomChordInKey(key);
  let chords = [startingChord];
  let success = true;
  for (let i = 0; i < bars - 1; i++) {
    let candidateCRs = shuffleArray((chords[i].type === MA ? maCRs : miCRs));
    let candidateChord;
    let j = 0;
    while (j < candidateCRs.length) {
      candidateChord = {
        root: addNotes(chords[i].root, candidateCRs[j].rel),
        type: candidateCRs[j].to,
      }
      if (isChordInKey(candidateChord, key)) {
        break;
      }
      j++;
    };
    if (j == candidateCRs.length) {
      success = false;
      break;
    }
    chords.push(candidateChord);
  }
  if (success) {
    return chords;
  } else {
    return generateProgression(key, bars);
  }
}

let potentialProgression;
do {
  potentialProgression = generateProgression(key, 16);
} while (potentialProgression[15].root !== key.root || potentialProgression[15].type !== key.type);

console.log(potentialProgression.map(getFormattedChord));
