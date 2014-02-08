// Morse sign synthesis in pure JavaScript
// MIT License (2014) by Thomas Schmidt (netaction.de)

function morseSynth() {

	// default speed 25WPM (words per minute)
	// the value is in milliseconds
	this.ditLength = 48;

	// Volume 1 = 100%, more leads to harmonics due to overmodulation
	this.volume = 1;

	// extra pause after every character (dit-length)
	// default = 0, use 2 or 3 for training
	this.farnsworth = 0;

	// methods to call at beginning of each character
	this.characterCallbacks = [];

	// methods to call at successful end of playing message
	this.messageCallbacks = [];

	// already playing a message?
	this.playing = false;

	// Message to play next
	this.message = '';

	this.morseCodes = {
		// third column: greek
		// fourth column: cyrillic
		'A':'·−',   'a':'·−',   'Α':'·−',   'А':'·−',
		'B':'−···', 'b':'−···', 'Β':'−···', 'Б':'−···',
		'C':'−·−·', 'c':'−·−·', 'Θ':'−·−·', 'Ц':'−·−·',
		'D':'−··',  'd':'−··',  'Δ':'−··',  'Д':'−··',
		'E':'·',    'e':'·',    'Ε':'·',    'Е':'·',
		'F':'··−·', 'f':'··−·', 'Φ':'··−·',
		'G':'−−·',  'g':'−−·',  'Γ':'−−·',  'Г':'−−·',
		'H':'····', 'h':'····', 'Η':'····', 'Х':'····',
		'I':'··',   'i':'··',               'И':'··',
		'J':'·−−−', 'j':'·−−−',             'Й':'·−−−',
		'K':'−·−',  'k':'−·−',              'К':'−·−', // invitation to transmit
		'L':'·−··', 'l':'·−··',
		'M':'−−',   'm':'−−',
		'N':'−·',   'n':'−·',
		'O':'−−−',  'o':'−−−',
		'P':'·−−·', 'p':'·−−·',
		'Q':'−−·−', 'q':'−−·−', 'Ψ':'−−·−', 'Щ':'−−·−',
		'R':'·−·',  'r':'·−·',  'Ρ':'·−·',
		'S':'···',  's':'···',  'Σ':'···',
		'T':'−',    't':'−',    'Τ':'−',
		'U':'··−',  'u':'··−',
		'V':'···−', 'v':'···−', 'Ж':'···−',
		'W':'·−−',  'w':'·−−',  'Ω':'·−−',  'В':'·−−',
		'X':'−··−', 'x':'−··−',             'Ь':'−··−', 'Ъ':'−··−',
		'Y':'−·−−', 'y':'−·−−', 'Υ':'−·−−', 'Ы':'−·−−', 'Ь':'−·−−',
		'Z':'−−··', 'z':'−−··', 'Ζ':'−−··', 'З':'−−··',

		'0':'−−−−−',
		'1':'·−−−−',
		'2':'··−−−',
		'3':'···−−',
		'4':'····−',
		'5':'·····',
		'6':'−····',
		'7':'−−···',
		'8':'−−−··',
		'9':'−−−−·',

		'À':'·−−·−', 'à':'·−−·−', 'Å':'·−−·−', 'å':'·−−·−',
		'Ä':'·−·−',  'ä':'·−·−',  'æ':'·−·−',  'ą':'·−·−',  'Я':'·−·−',
		'È':'·−··−', 'è':'·−··−', 'ł':'·−··−',
		'É':'··−··', 'é':'··−··', 'đ':'··−··', 'ę':'··−··', 'Э':'··−··',
		'Ö':'−−−·',  'ö':'−−−·',  'ø':'−−−·',  'ó':'−−−·',  'Ч':'−−−·',
		'Ü':'··−−',  'ü':'··−−',  'Ю':'··−−',
		'ç':'−·−··',  'ĉ':'−·−··',  'ć':'−·−··',
		'ĝ':'−−·−·',
		'ŝ':'···−·',

		'ẞ':'···−−··', 'ß':'···−−··',
		'CH':'−−−−', 'ch':'−−−−', 'Š':'−−−−', 'š':'−−−−', 'Χ':'−−−−', 'Ш':'−−−−', 'ĥ':'−−−−',
		'Ñ':'−−·−−', 'ñ':'−−·−−', 'ń':'−−·−−',
		// CH will never be used as there is no equivalent Unicode ligature.

		'.':'·−·−·−',
		',':'−−··−−',
		':':'−−−···',
		';':'−·−·−·',
		'?':'··−−··',
		'!':'−·−·−−',
		'-':'−····−',
		'_':'··−−·−',
		'(':'−·−−·',
		')':'−·−−·−',
		'\'':'·−−−−·',
		'"':'·−··−·',
		'=':'−···−',
		'+':'·−·−·', // AR
		'/':'−··−·',
		'@':'·−−·−·',
		'$':'···−··−·',
		'&':'·−···', // AS

		'<AA>':'·−·−', // Space down one line (new line)
		'<AR>':'·−·−·', // Stop copying (end of message)
		'<AS>':'·−···', // Wait
		'<BK>':'−···−·−', // BreaK
		'<BT>':'−···−', // Space down two lines (new paragraph)
		'<CL>':'−·−··−··', // CLosing down
		'<CT>':'−·−·−', '<KA>':'−·−·−', // Attention, Commencing Transmission
		'<KN>':'−·−−·', // Invitation to a specific named station to transmit
		'<SK>':'···−·−', '<VA>':'···−·−', // End of contact
		'<SN>':'···−·', '<VE>':'···−·', // Understood
		'<SOS>':'···−−−···', // Serious distress message
		'<HH>':'········', // Error

		' ':' ',
		'>':'    ', // "visible" pause before message
		'\t':'  ',
		'\n':'   ',

		// TODO: Add Japanese, Persian, Arabic or Hebrew and some small letters
		// Please drop a mail if you need other letters.
	};


	// Constructor
	(function(self) {
		self.context =
			new (window.AudioContext || window.webkitAudioContext);

		self.gainNode = self.context.createGain();
		self.gainNode.connect(self.context.destination);
		self.gainNode.gain.value = 0;

		self.oscillatorNode =
			self.context.createOscillator();
		self.oscillatorNode.type = 0;
		self.oscillatorNode.frequency.value = 600;
		self.oscillatorNode.connect(self.gainNode);
		self.oscillatorNode.start(0);
	})(this);

	this.frequency = function(frequency) {
		// set frequency in HZ
		this.oscillatorNode.frequency.value = frequency;
	};

	this.speed = function(wpm) {
		// 1200ms per dit is 1WPM
		this.ditLength = 1200/wpm;
	};

	this.stop = function() {
		this.message = '';
	};

	this.play = function(message) {
		// not in recursion
		if (!self) var self = this;

		// Use already saved message if no new message is given
		message = message || self.message;

		// nothing to do?
		if (message == '') {
			for (var i=0;i<self.messageCallbacks.length;i++)
				self.messageCallbacks[i]();
			return;
		}

		// already playing?
		if (self.playing) return;
		self.playing = true;

		// Fetch next character from message string:
		var character = message[0];
		self.message = message.slice(1);
		// TODO respect <KA> <SOS>

	
		// Lookup morse code for next character
		if (!self.morseCodes[character]) {
			console.log("Character '"+character+"' unknown.");
			character = " ";
		}
		// Send next character as plain text back to visualisation or anything:
		for (var i=0;i<self.characterCallbacks.length;i++)
			self.characterCallbacks[i](character);
		character = self.morseCodes[character];


		var lengthSum=0;
		var now = self.context.currentTime;
		// set ramp time to 2 periods
		var rampTime = 1/self.oscillatorNode.frequency.value*2;
		for(var i=0;i<character.length;i++) {
			// iterate dits and dahs
			if (character[i]=='·') {
				self.gainNode.gain.linearRampToValueAtTime(
					0, now + (lengthSum+1)*self.ditLength/1000);
				self.gainNode.gain.linearRampToValueAtTime(
					self.volume, now + (lengthSum+1)*self.ditLength/1000 +
					rampTime);

				self.gainNode.gain.linearRampToValueAtTime(
					self.volume, now + (lengthSum+2)*self.ditLength/1000);
				self.gainNode.gain.linearRampToValueAtTime(
					0, now + (lengthSum+2)*self.ditLength/1000 +
					rampTime);

				lengthSum+=2;
			} else if (character[i]=='−') {
				self.gainNode.gain.linearRampToValueAtTime(
					0, now + (lengthSum+1)*self.ditLength/1000);
				self.gainNode.gain.linearRampToValueAtTime(
					self.volume, now + (lengthSum+1)*self.ditLength/1000 +
					rampTime);

				self.gainNode.gain.linearRampToValueAtTime(
					self.volume, now + (lengthSum+4)*self.ditLength/1000);
				self.gainNode.gain.linearRampToValueAtTime(
					0, now + (lengthSum+4)*self.ditLength/1000 +
					rampTime);

				lengthSum+=4;
			} else if (character[i]==' ') {
				lengthSum+=3; // plus 2 for last character and 2 for this added below = 7
			}
		}
		window.setTimeout(function(){
			self.playing = false;
			self.play();
		}, (lengthSum+2+self.farnsworth)*self.ditLength);
		// two additional dits pause sum up to three dits between characters

	}; // play

} // function morseSynth

