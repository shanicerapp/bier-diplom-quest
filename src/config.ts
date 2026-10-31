/**
 * Spielinhalte der Geburtstagsprüfung.
 *
 * Alles, was man vor dem Verschenken anpassen möchte, steht in dieser Datei:
 * Name, Zugangscode, Rätsel, Antworten, Hinweise und die Texte der Urkunde.
 * Die Spiellogik liegt in den übrigen Dateien und muss nicht angefasst werden.
 */

/** Name des Kandidaten – erscheint in der Anrede und auf der Urkunde. */
export const RECIPIENT_NAME = 'Jan-Erik';

/** Zugangscode für das letzte Tor (nur Ziffern). Vor dem Verschenken hier ändern! */
export const VAULT_PIN = '426721';

/** Hinweis am letzten Tor. Darf den Code selbst natürlich nicht verraten. */
export const VAULT_HINT =
  'Die bisherigen Prüfungen haben dir den Weg gewiesen, erinnerst du dich an alle?';

export const ACADEMY_NAME = 'Akademie der höheren Wissenschaft';
export const GAME_TITLE = 'Die außerordentliche Geburtstagsprüfung';

// ---------------------------------------------------------------------------
// Startbildschirm
// ---------------------------------------------------------------------------

export const START_SALUTATION = `Werter Kandidat ${RECIPIENT_NAME},`;

export const START_INTRO =
  'Du hast bereits bewiesen, dass du dich langfristig binden kannst. Doch bevor du dich als vollwertiger Erwachsener bezeichnen darfst, steht dir eine letzte akademische Herausforderung bevor. Nur wer Köpfchen, Kombinationsgabe und die nötige Reife beweist, erhält Zugang zur höchsten Auszeichnung unserer Akademie.';

export const START_NOTE =
  'Hinweis der Prüfungskommission: Im Rahmen dieser Prüfung werden sowohl die akademischen als auch die ehelichen Qualifikationen des Kandidaten bewertet.';

/** Kleingedrucktes unter jeder Prüfung. */
export const EXAM_RULE =
  '§ 3 der Prüfungsordnung: Hilfsmittel sind nicht zugelassen. Ausgenommen ist die eigene Ehefrau.';

// ---------------------------------------------------------------------------
// Prüfungen
// ---------------------------------------------------------------------------

export type LevelId = 'mathematik' | 'chemie' | 'botanik' | 'geografie';
export type Building = 'tower' | 'lab' | 'greenhouse' | 'city';

export type AnswerSpec =
  /** Zahl; Komma und Punkt werden beide akzeptiert. `alsoAccept` erlaubt z. B. „vier“. */
  | { kind: 'number'; value: number; alsoAccept?: string[] }
  /**
   * Text; Groß-/Kleinschreibung, Umlaute, Leerzeichen und kleine Tippfehler werden toleriert.
   * `rejected` listet echte falsche Antworten, die zufällig nur einen Buchstaben entfernt sind.
   */
  | { kind: 'text'; accepted: string[]; rejected?: string[] };

export interface LevelConfig {
  id: LevelId;
  numeral: string;
  /** Name des Ortes in der Prüfung, z. B. „Die mathematische Fakultät“. */
  faculty: string;
  /** Kurzer Name für die Karte. */
  mapLabel: string;
  title: string;
  building: Building;
  story: string;
  question: string;
  hint: string;
  answer: AnswerSpec;
  /** Wird erst nach dem Bestehen angezeigt. */
  solution: string;
  success: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 'mathematik',
    numeral: 'I',
    faculty: 'Die mathematische Fakultät',
    mapLabel: 'Mathematische Fakultät',
    title: 'Grundlagen der Mengenlehre',
    building: 'tower',
    story:
      'Im Turm der Rechenkunst stapeln sich Pergamente bis unter das Dach. Professor Summa rückt seine Brille zurecht und schiebt dir wortlos ein Blatt über den Tisch. Die Turmuhr tickt auffällig laut.',
    question:
      'Ein Forscher untersucht zwei Gruppen von Gefäßen. Gruppe A besteht aus zehn Einheiten mit jeweils 0,3. Gruppe B besteht aus zwei Einheiten mit jeweils 0,5. Wie groß ist die Summe?',
    hint: 'Multipliziere zuerst die Anzahl der Einheiten mit ihrem jeweiligen Wert.',
    answer: { kind: 'number', value: 4, alsoAccept: ['vier'] },
    solution: '4',
    success:
      'Exakt 4. Die Kommission notiert anerkennend: „Rechnet sicher – auch in Halben und Kleinen.“ Über die Maßeinheit schweigen wir an dieser Stelle diskret.',
  },
  {
    id: 'chemie',
    numeral: 'II',
    faculty: 'Das chemische Labor',
    mapLabel: 'Chemisches Labor',
    title: 'Organische Chemie I',
    building: 'lab',
    story:
      'Es blubbert, zischt und riecht verdächtig nach Feierabend. Zwischen Glaskolben und Destillierapparaten erwartet dich die Fakultät für organische Chemie mit gerunzelter Stirn.',
    question:
      'Eine organische Verbindung besitzt die Summenformel C₂H₆O. Sie entsteht bei der alkoholischen Gärung. Wie heißt diese Verbindung?',
    hint: 'Die gesuchte Substanz ist auch in alkoholischen Getränken enthalten.',
    answer: {
      kind: 'text',
      accepted: ['Ethanol', 'Äthanol', 'Ethylalkohol', 'Äthylalkohol', 'Alkohol', 'Trinkalkohol'],
      rejected: ['Methanol', 'Ethanal', 'Methylalkohol'],
    },
    solution: 'Ethanol',
    success:
      'Ethanol, C₂H₆O. Die Laborleitung ist beeindruckt und beschließt spontan, die Substanz heute Abend einer ausführlichen Geschmacksanalyse zu unterziehen – rein wissenschaftlich, versteht sich.',
  },
  {
    id: 'botanik',
    numeral: 'III',
    faculty: 'Der botanische Garten',
    mapLabel: 'Botanischer Garten',
    title: 'Pflanzenkunde',
    building: 'greenhouse',
    story:
      'Hinter beschlagenen Glasscheiben ranken üppige Gewächse bis unter die Kuppel. Der Gärtner der Akademie stützt sich auf seine Gießkanne und mustert dich: „Nur wer diese Pflanze kennt, darf weiter.“',
    question:
      'Eine Pflanze aus der Familie der Hanfgewächse wird beim Brauen verwendet. Ihre weiblichen Blütenstände enthalten Bitterstoffe und ätherische Öle. Wie heißt sie?',
    hint: 'Die gesuchte Pflanze ist für ihre Bitterkeit bekannt.',
    answer: {
      kind: 'text',
      accepted: ['Hopfen', 'Echter Hopfen', 'Humulus', 'Humulus lupulus', 'Hopfendolde', 'Hopfendolden'],
    },
    solution: 'Hopfen',
    success:
      'Hopfen, lateinisch Humulus lupulus. Der Gärtner nickt zufrieden und murmelt etwas von „Grundnahrungsmittel“. Das Ziel rückt spürbar näher.',
  },
  {
    id: 'geografie',
    numeral: 'IV',
    faculty: 'Die Stadt der Wissenschaft',
    mapLabel: 'Stadt der Wissenschaft',
    title: 'Geografische Orientierung',
    building: 'city',
    story:
      'Auf dem Kartentisch liegt ein vergilbter Stadtplan. Seltsam: Alle Straßen scheinen auf einen einzigen Punkt zuzulaufen. Ein Kartograf mit Tintenflecken an den Fingern wartet geduldig auf deine Antwort.',
    question:
      'Gesucht ist eine Stadt in Baden-Württemberg. Sie ist bekannt für ihr fächerförmiges Straßennetz, ihr Schloss und das KIT. Wie heißt die Stadt?',
    hint: 'Also da wirst ja wohl selbst draufkommen 🤓',
    answer: { kind: 'text', accepted: ['Karlsruhe', 'Carlsruhe', 'Fächerstadt', 'KA'] },
    solution: 'Karlsruhe',
    success:
      'Karlsruhe – die Fächerstadt. Merke dir diesen Ort gut: Genau hier wird in Kürze eine gewisse Urkunde ausgestellt.',
  },
];

// ---------------------------------------------------------------------------
// Rückmeldungen
// ---------------------------------------------------------------------------

export const EMPTY_ANSWER_MESSAGE = 'Ein leeres Blatt abzugeben ist mutig. Eine Antwort wäre trotzdem schön.';

export const WRONG_ANSWER_MESSAGES = [
  'Leider nein. Die Kommission runzelt synchron die Stirn.',
  'Interessanter Ansatz. Falsch, aber interessant.',
  'Knapp daneben ist auch vorbei. Und das war nicht einmal knapp.',
  'Die Akademie hat schon Schlimmeres gesehen. Aber nicht oft.',
  'Nein. Aber du siehst beim Nachdenken sehr klug aus.',
  'Die Kommission notiert: „Kandidat bleibt optimistisch.“',
  'Das wäre eine schöne Antwort – auf eine andere Frage.',
];

export const LOCKED_MESSAGE = 'Verschlossen. Erst die vorherige Prüfung bestehen.';
export const VAULT_LOCKED_MESSAGE = 'Das letzte Tor öffnet sich erst nach allen vier Prüfungen.';

export const VAULT_TITLE = 'Das letzte Hindernis';
export const VAULT_TEXT =
  'Du stehst vor dem letzten Tor zur höchsten Auszeichnung der Akademie. Die bisherigen Prüfungen haben dich vorbereitet. Doch nur wer den korrekten Zugangscode kennt, darf eintreten.';

export const WRONG_PIN_MESSAGES = [
  'Das Tor bleibt unbeeindruckt.',
  'Die Riegel rühren sich nicht.',
  'Falscher Code. Das Schloss knarzt spöttisch.',
  'Irgendwo hinter dem Tor lacht leise ein Professor.',
];

// ---------------------------------------------------------------------------
// Urkunde
// ---------------------------------------------------------------------------

export const DIPLOMA = {
  greeting: `Herzlichen Glückwunsch zum Geburtstag, ${RECIPIENT_NAME}!`,
  academy: 'Akademie der höheren Bierwissenschaft',
  title: 'Ehrenurkunde',
  intro: 'Hiermit wird',
  awardText: 'nach erfolgreichem Abschluss sämtlicher Aufnahmeprüfungen der akademische Grad',
  degree: 'Bierdiplom',
  awarded: 'verliehen.',
  qualifications:
    'Qualifiziert in angewandter Hopfenkunde, organischer Getränketechnologie und fortgeschrittener Geselligkeit.',
  special: 'Besondere Anerkennung für die erfolgreiche Bewältigung der Ehe-Eignungsprüfung.',
  place: 'Karlsruhe',
  signature: 'Die Prüfungskommission',
  disclaimer:
    'Diese Urkunde ist frei erfunden und rein humoristisch. Sie begleitet ein echtes Geburtstagsgeschenk und verleiht keinerlei akademischen Grad.',
  finePrint: 'Humorvolle, fiktive Urkunde zum Geburtstag – kein anerkannter akademischer Abschluss.',
};

/** Gesamturteil nach Anzahl der Fehlversuche in den vier Prüfungen. */
export const GRADES: { maxWrong: number; label: string }[] = [
  { maxWrong: 0, label: 'summa cum laude' },
  { maxWrong: 3, label: 'magna cum laude' },
  { maxWrong: 8, label: 'cum laude' },
  { maxWrong: Infinity, label: 'rite – mit bemerkenswertem Durchhaltevermögen' },
];
