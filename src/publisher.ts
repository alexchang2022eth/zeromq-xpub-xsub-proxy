
import zmq from "zeromq"

import zmqPackageJson from 'zeromq/package.json' assert { type: "json"}

const version = zmqPackageJson.version

const pub_addr = 'tcp://127.0.0.1:3333' // publishers send here
async function publisher(i) {

  if (version.startsWith('5')) {
    // @ts-ignore
	const sock = zmq.socket("pub")

	await sock.connect(pub_addr)
	console.log("Publisher", i, "bound to", pub_addr)

	while (true) { // repeat forever
		await new Promise(resolve => setTimeout(resolve, Math.floor(500 + Math.random() * 1000))) // random timeout to reduce spam
		console.log("Publisher", i, "sending msg")
		await sock.send(["global-notification", "meeow! it's " + Date.now()])
	}
  } else {
	const sock = new zmq.Publisher({
        sendHighWaterMark: 10000,
    })

	await sock.connect(pub_addr)
	console.log("Publisher", i, "bound to", pub_addr)

	while (true) { // repeat forever
		await new Promise(resolve => setTimeout(resolve, Math.floor(500 + Math.random() * 1000))) // random timeout to reduce spam
		console.log("Publisher", i, "sending msg")
		await sock.send(["global-notification", "meeow! it's " + Date.now()])
	}
  }
}

async function main() {
  Promise.all([
    publisher('1'),
    publisher('2')
  ])
}

main()
