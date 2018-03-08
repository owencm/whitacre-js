'use strict';

const MA = 0, MI = 1;

const key = { root: 0, type: MI }

const notesPerChord = 2
const chordCount = 7

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

const assert = (bool, err) => {
  if (err === undefined) {
    err = 'Assertion failure';
  }
  if (!bool) {
    throw new Error(err);
  }
}

const zipArrays = (arrA, arrB, aLabel, bLabel) => {
  let result = [];
  assert(arrA.length === arrB.length);
  for (let i = 0; i < arrA.length; i++) {
    result.push({ [aLabel]: arrA[i], [bLabel]: arrB[i] });
  }
  return result;
}

const maScale = [0, 2, 4, 5, 7, 9, 11];
const miScale = [0, 2, 3, 5, 7, 8, 10, 11];

// How nice do the notes sound in a melody?
const maScaleScored = [ 5, 0, 3, 0, 5, 10, 0, 5, 0, 2, 0, 3];
const miScaleScored = [ 5, 0, 3, 5, 0, 2, 0, 5, 2, 0, 3, 0];

// // Relative to the chord
// const maChordIntervalScored = [ 5, 2, 5, 1, 5, 1, 1 ]

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

const getChordNotes = (chord, key) => {
  return (chord.type === MA ? maChord : miChord).map((note) =>
    addNotes(note, chord.root)
  )
}

const isChordInKey = (chord, key) => {
  return areNotesInKey(getChordNotes(chord, key), key);
}

isChordInKey({root: 0, type: MA}, {root: 0, type: MA});

const getFormattedNote = (note) => {
  const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  return noteNames[note];
}

const getFormattedChord = (chord) => {
  return getFormattedNote(chord.root) + (chord.type === MI ? 'm' : '');
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

const scoreProgression = (progression, key) => {
  const scoreFirstChordMatchesMajorMinor = () => {
    return progression[0].type === key.type ? 1 : 0
  }
  const scoreLastChordIsRoot = () => {
    const lastChord = progression[progression.length - 1]
    return (lastChord.root === key.root) && (lastChord.type === key.type) ? 1 : 0
  }
  return scoreFirstChordMatchesMajorMinor() * scoreLastChordIsRoot()
}
//
// const getInterval({ note, chord, key }) {
//   (note - chord.root + 12) % 12
//   return
// }

const average = (arr) => arr.reduce((a, b) => a + b) / arr.length
const multiply = (arr) => arr.reduce((a, b) => a * b)

const scoreMelody = (melody, progression, key) => {
  const scoreShortDistances = () => {
    let score = 0;
    for (let i = 0; i < melody.length - 1; i++) {
      score += (Math.abs(melody[i] - melody[i+1]) < 4) ? 1 : 0;
    }
    return score / (melody.length - 1);
  }
  const scoreLastNoteRoot = () => {
    return (melody[melody.length-1] == key.root) ? 1 : 0
  }
  const scoreStability = () => {
    let stabilities = []
    for (let i = 0; i < progression.length; i++) {
      for (let j = 0; j < notesPerChord; j++) {
        let chord = progression[i]
        let note = melody[i * notesPerChord + j]
        if (note == chord.root) {
          stabilities.push(1)
          continue
        }
        let chordNotes = getChordNotes(chord, key)
        if (chordNotes.indexOf(note) > -1) {
          stabilities.push(0.95)
          continue
        }
        // If it's on the 1 beat
        if (j == 0) {
          stabilities.push(0.3)
        } else {
          stabilities.push(0.8)
        }
      }
    }
    console.log(stabilities)
    return multiply(stabilities)
  }
  return multiply([scoreShortDistances(), scoreLastNoteRoot(), scoreStability()]);
}

const chooseNoteAccordingToNiceness = (chord) => {
  const scaleScored = chord.type === MA ? maScaleScored : miScaleScored;
  const total = scaleScored.reduce((a, b) => a+b);
  const randomN = random(0, total-1);
  let i = 0;
  let runningTotal = 0;
  // console.log(scaleScored);
  do {
    runningTotal += scaleScored[i];
    i++;
    // console.log({randomN, i, runningTotal});
  } while (i < scaleScored.length && randomN > runningTotal);
  // console.log(`Random was ${randomN}, so chose ${i-1}`);
  return addNotes(i - 1, chord.root);
}

const chooseNoteInKeyAccordingToNiceness = (chord, key) => {
  let candidateNote;
  do {
    candidateNote = chooseNoteAccordingToNiceness(chord);
  } while (!isNoteInKey(candidateNote, key));
  return candidateNote;
}

const generateRandomMelody = (progression, key, notesPerChord) => {
  const notes = [];
  for (let i = 0; i < progression.length; i++) {
    for (let j = 0; j < notesPerChord; j++) {
      notes.push(chooseNoteInKeyAccordingToNiceness(progression[i], key));
    }
  }
  // Force the last note to be the root to avoid randomly generating melodies without this property
  notes[(progression.length - 1) * 2 + 1] = key.root
  return notes;
}

let potentialProgression, potentialProgressionScore;
do {
  potentialProgression = generateProgression(key, chordCount);
  potentialProgressionScore = scoreProgression(potentialProgression, key)
} while (potentialProgressionScore < 0.6)

const progression = potentialProgression

let potentialMelody, potentialMelodyScore
do {
  // TODO: score as we go along in segments and then score at the end
  potentialMelody = generateRandomMelody(progression, key, notesPerChord)
  potentialMelodyScore = scoreMelody(potentialMelody, progression, key, notesPerChord)
} while (potentialMelodyScore < 0.4)

console.log('Melody score', potentialMelodyScore)

const melody = potentialMelody

const formattedProgression = progression.map(chord => getFormattedChord(chord));
const formattedMelody = melody.map(note => getFormattedNote(note));

for (let i = 0; i < formattedProgression.length; i++) {
  let notes = []
  for (let j = 0; j < notesPerChord; j++) {
    notes.push(formattedMelody[i * notesPerChord + j])
  }
  console.log(`Chords: ${formattedProgression[i]}, notes: ${notes}`)
}
