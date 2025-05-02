function audioplayer(b64) {
    this.ctx = new AudioContext();
    this.src = null;
    this.buf = null;
    this.playing = false;
    this.time = 0;
    this.start = 0;
    this.load(b64);
}

audioplayer.prototype.load = function(b64) {
    var raw = atob(b64.split(",")[1]);
    var len = raw.length;
    var arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = raw.charCodeAt(i);
    var self = this;
    this.ctx.decodeAudioData(arr.buffer, function(b) {self.buf = b;});
};

audioplayer.prototype.play = function() {
    if (!this.buf) return;
    this.src = this.ctx.createBufferSource();
    this.src.buffer = this.buf;
    this.src.connect(this.ctx.destination);
    var off = this.time > 0 ? this.time : 0;
    this.start = this.ctx.currentTime - off;
    this.src.start(0, off);
    this.playing = true;
    var self = this;
    this.src.onended = function() {self.playing = false;self.time = 0;};
};

audioplayer.prototype.pause = function() {
    if (!this.playing) return;
    this.src.stop();
    this.time = this.ctx.currentTime - this.start;
    this.playing = false;
};

audioplayer.prototype.toggle = function() {
    this.playing ? this.pause() : this.play();
};

audioplayer.prototype.playNote = function(freq, velocity, dur,offset) {
if (!this.buf) return;
const source = this.ctx.createBufferSource();
source.buffer = this.buf;

source.playbackRate.value = Math.pow(2, (freq-60) / 12);

const gainNode = this.ctx.createGain();
gainNode.gain.value = 1;

source.connect(gainNode);
gainNode.connect(this.ctx.destination);

source.start(offset);
source.stop(this.ctx.currentTime + offset+ dur+2);

};
audioplayer.prototype.playMidi = function(midiData){
    const startTime = this.ctx.currentTime;

    midiData.tracks.forEach(track => {
        track.notes.forEach(note => {
            const freq = note.midi;
            const velocity = note.velocity;
            const duration = note.duration;
            const timeOffset = note.time;

            this.playNote(freq, velocity, duration, timeOffset);
        });
    });
};
