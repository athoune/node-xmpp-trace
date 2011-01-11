#!/usr/bin/env node

var pcap = require('pcap'),
	color = require('colors'),
	XmppParser = require('xmpp-trace').XmppParser,
	sys = require('sys');

var NS_XMPP_SASL = 'urn:ietf:params:xml:ns:xmpp-sasl';

var ClientServer = function(server) {
	this.server_ip = server;
	var cs = this;
	this.client_parser = new XmppParser('client');
	this.client_parser.addListener('stanza', function(element) {
		console.log(element.toString().red);
	});
	this.server_parser = new XmppParser('server');
	this.server_parser.addListener('stanza', function(element) {
		console.log(element.toString().yellow);
		if(element.is('success', NS_XMPP_SASL)) {
			cs.client_parser.init();
			cs.server_parser.init();
		}
	});
}

var tcp_tracker = new pcap.TCP_tracker();
var int = '';
var pcap_session = pcap.createSession(int, "ip proto \\tcp and tcp port 5222");

tcp_tracker.on('start', function (session) {
    console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
});

tcp_tracker.on('end', function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
});

var clientServer = new ClientServer('192.168.1.15');

pcap_session.on('packet', function (raw_packet) {
	var packet = pcap.decode.packet(raw_packet);
	tcp_tracker.track_packet(packet);
		var ip  = packet.link.ip,
		        tcp = ip.tcp,
		        src = ip.saddr + ":" + tcp.sport;
		//console.log(src);
		if(ip.saddr == clientServer.server_ip) {
			if(tcp.data_bytes) {
				//console.log('server length: '.yellow, tcp.data.length);
				//sys.puts(tcp.data);
				clientServer.server_parser.write(tcp.data);
			}
		}
		if(ip.daddr == clientServer.server_ip) {
			if(tcp.data_bytes) {
				//console.log('client length: '.red, tcp.data.length);
				//sys.puts(tcp.data);
				clientServer.client_parser.write(tcp.data);
			}
		}
});

