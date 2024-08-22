
import zmq from "zeromq"

const pub_addr = 'tcp://127.0.0.1:3333' // publishers send here
async function publisher(i) {

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

async function main() {
  Promise.all([
    publisher('1'),
    publisher('2')
  ])
}

main()
