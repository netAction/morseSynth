morseSynth
==========

*Play morse code on your web page*

This library uses the sound synthesis that every modern browser offers. Works on desktop and phones and creates very soft sinus tones. There are no audio files.

To get started, download the *morseSynth.js* file and add it to your page.

    <script src="morseSynth.js"></script>

Play a message:

    var morse = new morseSynth();
    morse.play('Hello World.');


## Options

Change speed, default = 25WPM (words per minute).

    morse.speed(25);

Change frequency, default = 600Hz. Immediate effect.

    morse.frequency(600);

Change the volume, default 1 = 100%. Effect on next character.

    morse.volume = 1; 

Add a pause after every character or white space of three did length, default = 0.

    morse.farnsworth = 3;

Abort playback of the message if still playing, but finish current character first.

    morse.stop();

In many cases you need to know which character will be played next. You can register multiple functions that will be called on each character.

    morse.characterCallbacks.push(function(character){
      document.body.innerHTML += character;
    });

This is the same but will be called when the whole message has been sent.

    morse.messageCallbacks.push(function(){
      document.body.innerHTML += " <strong>DONE!</strong>";
    });

If you need to know if the morse code is playing check the boolean *morse.playing*.

To change the message while playing set a new string to *morse.message*. This variable always contains the rest of the message.

## Ideas

* Repeat morse code in plain text using *speech synthesis* like "CQ CQ from Delta Delta One Tango Sierra". When training handwriting or for learning without looking on the screen this could be nice. There are both speech synthesis libraries for browsers (bad quality) and web services providing WAV files for instant download (good quality).

* Add some *QRM noise* and fading of frequency and volume while playback using a loop and a random generator while playback.

* Emulate a *PileUp* by starting multiple morseSynth instances at once.

