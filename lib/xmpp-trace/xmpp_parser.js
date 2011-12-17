var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    StreamParser = require('./stream_parser').StreamParser;

var XmppParser = function(name) {
    this.name = name;
    this.init();
};

util.inherits(XmppParser, EventEmitter);
exports.XmppParser = XmppParser;

XmppParser.prototype.init = function() {
    this.first = true;
    this.parser = new StreamParser('UTF-8', 10 * 1024);
    var xmpp_parser = this;
    this.parser.addListener('stanza', function(element) {
        xmpp_parser.emit('stanza', element);
    });
    this.parser.addListener('end', function() {
        console.log('end');
        xmpp_parser.init();
    });
};

XmppParser.prototype.write = function(data) {
    if(this.first && !( data[0] == 60 && data[1] == 63)) { // <?
        this.parser.write('<stream:stream>');
    }
    this.first = false;
    this.parser.write(data);
};
