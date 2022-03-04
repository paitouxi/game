//% blockHidden=true
namespace music_ptx {
    const INTERNAL_MELODY_ENDED = 5;

    let beatsPerMinute: number = 120;
    //% whenUsed
    const freqs = hex`
        1f00210023002500270029002c002e003100340037003a003e004100450049004e00520057005c00620068006e00
        75007b0083008b0093009c00a500af00b900c400d000dc00e900f70006011501260137014a015d01720188019f01
        b801d201ee010b022a024b026e029302ba02e40210033f037003a403dc03170455049704dd0427057505c8052006
        7d06e0064907b8072d08a9082d09b9094d0aea0a900b400cfa0cc00d910e6f0f5a1053115b1272139a14d4152017
        8018f519801b231dde1e`;
    let _playTone: (frequency: number, duration: number) => void;
    const MICROBIT_MELODY_ID = 2000;

    /**
     * Plays a tone through pin ``P0`` for the given duration.
     * @param frequency pitch of the tone to play in Hertz (Hz), eg: Note.C
     * @param ms tone duration in milliseconds (ms)
     */
    //% help=music/play-tone weight=90
    //% blockId=device_play_note block="play|tone %note=device_note|for %duration=device_beat" blockGap=8
    //% parts="headphone"
    //% useEnumVal=1
    //% group="Tone"
    export function playTone(frequency: number, ms: number): void {
        if (_playTone) _playTone(frequency, ms);
        else pins_ptx.analogPitch(frequency, ms);    //paitouxi修改：改为自修改的pins_ptx文件，以便更改为非P0、P1、P2管脚
    }

    /**
     * Plays a tone through pin ``P0``.
     * @param frequency pitch of the tone to play in Hertz (Hz), eg: Note.C
     */
    //% help=music/ring-tone weight=80
    //% blockId=device_ring block="ring tone (Hz)|%note=device_note" blockGap=8
    //% parts="headphone"
    //% useEnumVal=1
    //% group="Tone"
    export function ringTone(frequency: number): void {
        playTone(frequency, 0);
    }

    /**
     * Rests (plays nothing) for a specified time through pin ``P0``.
     * @param ms rest duration in milliseconds (ms)
     */
    //% help=music/rest weight=79
    //% blockId=device_rest block="rest(ms)|%duration=device_beat"
    //% parts="headphone"
    //% group="Tone"
    export function rest(ms: number): void {
        playTone(0, ms);
    }


    /**
     * Gets the frequency of a note.
     * @param name the note name
     */
    //% weight=50 help=music/note-frequency
    //% blockId=device_note block="%name"
    //% shim=TD_ID color="#FFFFFF" colorSecondary="#FFFFFF"
    //% name.fieldEditor="note" name.defl="262"
    //% name.fieldOptions.decompileLiterals=true
    //% useEnumVal=1
    //% group="Tone"
    //% blockGap=8
    export function noteFrequency(name: Note): number {
        return name;
    }

    function init() {
        if (beatsPerMinute <= 0) beatsPerMinute = 120;
    }

    /**
     * Returns the duration of a beat in milli-seconds
     */
    //% help=music/beat weight=49
    //% blockId=device_beat block="%fraction|beat"
    //% group="Tempo"
    //% blockGap=8
    export function beat(fraction?: BeatFraction): number {
        init();
        if (fraction == null) fraction = BeatFraction.Whole;
        let beat = Math.idiv(60000, beatsPerMinute);
        switch (fraction) {
            case BeatFraction.Half: return beat >> 1;
            case BeatFraction.Quarter: return beat >> 2;
            case BeatFraction.Eighth: return beat >> 3;
            case BeatFraction.Sixteenth: return beat >> 4;
            case BeatFraction.Double: return beat << 1;
            case BeatFraction.Breve: return beat << 2;
            default: return beat;
        }
    }

    /**
     * Returns the tempo in beats per minute. Tempo is the speed (bpm = beats per minute) at which notes play. The larger the tempo value, the faster the notes will play.
     */
    //% help=music/tempo weight=40
    //% blockId=device_tempo block="tempo (bpm)" blockGap=8
    //% group="Tempo"
    export function tempo(): number {
        init();
        return beatsPerMinute;
    }

    /**
     * Change the tempo by the specified amount
     * @param bpm The change in beats per minute to the tempo, eg: 20
     */
    //% help=music/change-tempo-by weight=39
    //% blockId=device_change_tempo block="change tempo by (bpm)|%value" blockGap=8
    //% group="Tempo"
    //% weight=100
    export function changeTempoBy(bpm: number): void {
        init();
        setTempo(beatsPerMinute + bpm);
    }

    /**
     * Sets the tempo to the specified amount
     * @param bpm The new tempo in beats per minute, eg: 120
     */
    //% help=music/set-tempo weight=38
    //% blockId=device_set_tempo block="set tempo to (bpm)|%value"
    //% bpm.min=4 bpm.max=400
    //% group="Tempo"
    //% weight=99
    export function setTempo(bpm: number): void {
        init();
        if (bpm > 0) {
            beatsPerMinute = Math.max(1, bpm);
        }
    }

    let currentMelody: Melody;
    let currentBackgroundMelody: Melody;

    /**
     * Gets the melody array of a built-in melody.
     * @param name the note name, eg: Note.C
     */
    //% weight=50 help=music/builtin-melody
    //% blockId=device_builtin_melody block="%melody"
    //% blockHidden=true
    //% group="Melody Advanced"
   // export function builtInMelody(melody: Melodies): string[] {   //因为报错，所以注释掉。
   //     return getMelody(melody);
   // }

    /**
     * Registers code to run on various melody events
     */
    //% blockId=melody_on_event block="music on %value"
    //% help=music/on-event weight=59 blockGap=32
    //% group="Melody Advanced"
    export function onEvent(value: MusicEvent, handler: () => void) {
        control.onEvent(MICROBIT_MELODY_ID, value, handler);
    }

    /**
     * Use startMelody instead
     */
    //% hidden=1 deprecated=1
    //% parts="headphone"
    //% group="Melody Advanced"
    export function beginMelody(melodyArray: string[], options: MelodyOptions = 1) {
        return startMelody(melodyArray, options);
    }

    /**
     * Starts playing a melody.
     * Notes are expressed as a string of characters with this format: NOTE[octave][:duration]
     * @param melodyArray the melody array to play
     * @param options melody options, once / forever, in the foreground / background
     */
    //% help=music/begin-melody weight=60 blockGap=16
    //% blockId=device_start_melody block="start melody %melody=device_builtin_melody| repeating %options"
    //% parts="headphone"
    //% group="Melody Advanced"
    export function startMelody(melodyArray: string[], options: MelodyOptions = 1) {
        init();
        if (currentMelody != undefined) {
            if (((options & MelodyOptions.OnceInBackground) == 0)
                && ((options & MelodyOptions.ForeverInBackground) == 0)
                && currentMelody.background) {
                currentBackgroundMelody = currentMelody;
                currentMelody = null;
                control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyPaused);
            }
            if (currentMelody)
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyEnded : MusicEvent.MelodyEnded);
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyStarted : MusicEvent.MelodyStarted);
        } else {
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyStarted : MusicEvent.MelodyStarted);
            // Only start the fiber once
            control.inBackground(() => {
                while (currentMelody.hasNextNote()) {
                    playNextNote(currentMelody);
                    if (!currentMelody.hasNextNote() && currentBackgroundMelody) {
                        // Swap the background melody back
                        currentMelody = currentBackgroundMelody;
                        currentBackgroundMelody = null;
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.MelodyEnded);
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyResumed);
                        control.raiseEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
                    }
                }
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background ? MusicEvent.BackgroundMelodyEnded : MusicEvent.MelodyEnded);
                if (!currentMelody.background)
                    control.raiseEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
                currentMelody = null;
            })
        }
    }


    /**
     * Play a melody from the melody editor.
     * @param melody - string of up to eight notes [C D E F G A B C5] or rests [-] separated by spaces, which will be played one at a time, ex: "E D G F B A C5 B "
     * @param tempo - number in beats per minute (bpm), dictating how long each note will play for
     */
    //% block="play melody $melody at tempo $tempo|(bpm)" blockId=playMelody
    //% weight=85 blockGap=8 help=music/play-melody
    //% melody.shadow="melody_editor"
    //% tempo.min=40 tempo.max=500
    //% tempo.defl=120
    //% parts=headphone
    //% group="Melody"
    export function playMelody(melody: string, tempo: number) {
        melody = melody || "";
        setTempo(tempo);
        let notes: string[] = melody.split(" ").filter(n => !!n);
        let newOctave = false;

        // build melody string, replace '-' with 'R' and add tempo
        // creates format like "C5-174 B4 A G F E D C "
        for (let i = 0; i < notes.length; i++) {
            if (notes[i] === "-") {
                notes[i] = "R";
            } else if (notes[i] === "C5") {
                newOctave = true;
            } else if (newOctave) { // change the octave if necesary
                notes[i] += "4";
                newOctave = false;
            }
        }

        music.startMelody(notes, MelodyOptions.Once)
        control.waitForEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
    }

    /**
     * Create a melody with the melody editor.
     * @param melody
     */
    //% block="$melody" blockId=melody_editor
    //% blockHidden = true
    //% weight=85 blockGap=8
    //% duplicateShadowOnDrag
    //% melody.fieldEditor="melody"
    //% melody.fieldOptions.decompileLiterals=true
    //% melody.fieldOptions.decompileIndirectFixedInstances="true"
    //% melody.fieldOptions.onParentBlock="true"
    //% shim=TD_ID
    //% group="Melody"
    export function melodyEditor(melody: string): string {
        return melody;
    }

    /**
     * Stops the melodies
     * @param options which melody to stop
     */
    //% help=music/stop-melody weight=59 blockGap=16
    //% blockId=device_stop_melody block="stop melody $options"
    //% parts="headphone"
    //% group="Melody Advanced"
    export function stopMelody(options: MelodyStopOptions) {
        if (options & MelodyStopOptions.Background)
            startMelody([], MelodyOptions.OnceInBackground);
        if (options & MelodyStopOptions.Foreground)
            startMelody([], MelodyOptions.Once);
    }

    /**
     * Stop all sounds and melodies currently playing.
     */
    //% help=music/stop-all-sounds
    //% blockId=music_stop_all_sounds block="stop all sounds"
    //% weight=10
    //% group="Volume"
    export function stopAllSounds() {
        rest(0);
        stopMelody(MelodyStopOptions.All);
        music.__stopSoundExpressions();
    }


    /**
     * Sets a custom playTone function for playing melodies
     */
    //% help=music/set-play-tone
    //% advanced=true
    //% group="Tone"
    export function setPlayTone(f: (frequency: number, duration: number) => void) {
        _playTone = f;
    }

    function playNextNote(melody: Melody): void {
        // cache elements
        let currNote = melody.nextNote();
        let currentPos = melody.currentPos;
        let currentDuration = melody.currentDuration;
        let currentOctave = melody.currentOctave;

        let note: number;
        let isrest: boolean = false;
        let beatPos: number;
        let parsingOctave: boolean = true;
        let prevNote: boolean = false;

        for (let pos = 0; pos < currNote.length; pos++) {
            let noteChar = currNote.charAt(pos);
            switch (noteChar) {
                case 'c': case 'C': note = 1; prevNote = true; break;
                case 'd': case 'D': note = 3; prevNote = true; break;
                case 'e': case 'E': note = 5; prevNote = true; break;
                case 'f': case 'F': note = 6; prevNote = true; break;
                case 'g': case 'G': note = 8; prevNote = true; break;
                case 'a': case 'A': note = 10; prevNote = true; break;
                case 'B': note = 12; prevNote = true; break;
                case 'r': case 'R': isrest = true; prevNote = false; break;
                case '#': note++; prevNote = false; break;
                case 'b': if (prevNote) note--; else { note = 12; prevNote = true; } break;
                case ':': parsingOctave = false; beatPos = pos; prevNote = false; break;
                default: prevNote = false; if (parsingOctave) currentOctave = parseInt(noteChar);
            }
        }
        if (!parsingOctave) {
            currentDuration = parseInt(currNote.substr(beatPos + 1, currNote.length - beatPos));
        }
        let beat = Math.idiv(60000, beatsPerMinute) >> 2;
        if (isrest) {
            music.rest(currentDuration * beat)
        } else {
            let keyNumber = note + (12 * (currentOctave - 1));
            let frequency = freqs.getNumber(NumberFormat.UInt16LE, keyNumber * 2) || 0;
            music.playTone(frequency, currentDuration * beat);
        }
        melody.currentDuration = currentDuration;
        melody.currentOctave = currentOctave;
        const repeating = melody.repeating && currentPos == melody.melodyArray.length - 1;
        melody.currentPos = repeating ? 0 : currentPos + 1;

        control.raiseEvent(MICROBIT_MELODY_ID, melody.background ? MusicEvent.BackgroundMelodyNotePlayed : MusicEvent.MelodyNotePlayed);
        if (repeating)
            control.raiseEvent(MICROBIT_MELODY_ID, melody.background ? MusicEvent.BackgroundMelodyRepeated : MusicEvent.MelodyRepeated);
    }

    class Melody {
        public melodyArray: string[];
        public currentDuration: number;
        public currentOctave: number;
        public currentPos: number;
        public repeating: boolean;
        public background: boolean;

        constructor(melodyArray: string[], options: MelodyOptions) {
            this.melodyArray = melodyArray;
            this.repeating = ((options & MelodyOptions.Forever) != 0);
            this.repeating = this.repeating ? true : ((options & MelodyOptions.ForeverInBackground) != 0)
            this.background = ((options & MelodyOptions.OnceInBackground) != 0);
            this.background = this.background ? true : ((options & MelodyOptions.ForeverInBackground) != 0);
            this.currentDuration = 4; //Default duration (Crotchet)
            this.currentOctave = 4; //Middle octave
            this.currentPos = 0;
        }

        hasNextNote() {
            return this.repeating || this.currentPos < this.melodyArray.length;
        }

        nextNote(): string {
            const currentNote = this.melodyArray[this.currentPos];
            return currentNote;
        }
    }
}
