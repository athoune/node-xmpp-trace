XMPP-TRACE
==========

Xmpp-trace is a debugging tool for jabber's protocol. Psi is ugly, I don't like it.

Status
------

Rough alpha.

Just color, no xml syntax highlighting.

Usage
-----

		npm install .
		sudo xmpp_trace 192.168.1.2

Don't use SSL if you wont to see something, xmpp_trace is a debugging tool, not a man in the middle weapon. Not yet.

You can start xmp_trace before launching the client, or during a session. It's just sniffing, no proxying, you can stop when you wont.

Thanks
------

This work is just glue from node-pcap and node-xmpp, with stolen code and libs from both.