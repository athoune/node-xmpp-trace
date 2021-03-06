#!/usr/bin/env node

var pcap = require('pcap'),
    color = require('colors'),
    XmppParser = require('xmpp-trace').XmppParser,
    sys = require('sys');

var NS_XMPP_SASL = 'urn:ietf:params:xml:ns:xmpp-sasl';

var targets = {};

process.title = "xmpp_trace";

var ClientServer = function(server) {
    targets[server] = this;
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
};

ClientServer.prototype.write_client = function(data) {
    this.client_parser.write(data);
};

ClientServer.prototype.write_server = function(data) {
    this.server_parser.write(data);
};

var tcp_tracker = new pcap.TCP_tracker();
var network_interface = '';
var pcap_session = pcap.createSession(network_interface, "ip proto \\tcp and tcp port 5222");

tcp_tracker.on('start', function (session) {
    console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
});

tcp_tracker.on('end', function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
});

var ips = process.argv;
ips.shift();
ips.shift();
if(ips.length === 0) {
    sys.error("I need some IP");
    process.exit(1);
}
ips.forEach(function(ip) {
    new ClientServer(ip);
});

console.log("listening".green, Object.keys(targets));

pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
        var ip  = packet.link.ip,
                tcp = ip.tcp,
                src = ip.saddr + ":" + tcp.sport;
        //console.log(src);
        if(tcp.data_bytes) {
            if(targets[ip.saddr] !== null) {
                //console.log('server length: '.yellow, tcp.data.length);
                //sys.puts(tcp.data);
                targets[ip.saddr].write_server(tcp.data);
            }
            if(targets[ip.daddr] !== null) {
                //console.log('client length: '.red, tcp.data.length);
                //sys.puts(tcp.data);
                targets[ip.daddr].write_client(tcp.data);
            }
        }
});

