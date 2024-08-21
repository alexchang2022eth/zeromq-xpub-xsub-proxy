
import zmq from "zeromq"

import zmqPackageJson from 'zeromq/package.json' assert { type: "json"}

const version = zmqPackageJson.version

const sub_addr = 'tcp://127.0.0.1:3301' // subscribers receive here

async function subscriber(i) {
  if (version.startsWith('5')) {
    // @ts-ignore
    const sock = zmq.socket('sub');
	sock.connect(sub_addr)
	sock.subscribe("global-notification")
	console.log("Subscriber", i, "connected to", sub_addr)
    sock.on("message", (topic, msg)=> {
		console.log("Subscriber", i, "received topic", topic.toString(), "with message", msg.toString())
    })
  } else {
	const sock = new zmq.Subscriber({
        receiveHighWaterMark: 10000,
    })

	sock.connect(sub_addr)
	//sock.subscribe("global-notification")
	sock.subscribe("")
	console.log("Subscriber", i, "connected to", sub_addr)

	for await (const [topic, msg] of sock) {
		console.log("Subscriber", i, "received topic", topic.toString(), "with message", msg.toString())
	}
  }
}

async function main() {
    await subscriber(1)
}

main()
