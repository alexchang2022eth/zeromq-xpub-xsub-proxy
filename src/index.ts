
import zmq from "zeromq"

import zmqPackageJson from 'zeromq/package.json' assert { type: "json"}

const version = zmqPackageJson.version

async function initProxyHub(options) {
  const xSubPort = Number(options.xSubPort) || 8800;
  const xPubPort = Number(options.xPubPort) || 8801;

  if (version.startsWith('5')) {
    // @ts-ignore
    const xsub = zmq.socket('xsub');
    xsub.bindSync(`tcp://*:${xSubPort}`);

    // @ts-ignore
    const xpub = zmq.socket('xpub');
    // @ts-ignore
    xpub.setsockopt(zmq.ZMQ_XPUB_VERBOSE, 1);
    xpub.bindSync(`tcp://*:${xPubPort}`);

    // Message pump
    xsub.on('message', (...args) => xpub.send(args));

    // Subscription pump
    xpub.on('message', data => xsub.send(data));

    if (options.debug === true) {
      console.info(`zmq-xpub-xsub listening at { xSubPort: ${xSubPort}, xPubPort: ${xPubPort} }`);
    }
  } else {
    const xsub = new zmq.XSubscriber()
    await xsub.bind(`tcp://*:${xSubPort}`)

    const xpub = new zmq.XPublisher()
    xpub.verbosity = 'allSubsUnsubs' // pass duplicates to caller
    await xpub.bind(`tcp://*:${xPubPort}`)

    if (options.debug === true) {
      console.info(`zmq-xpub-xsub listening at { xSubPort: ${xSubPort}, xPubPort: ${xPubPort} }`);
    }
    async function proxyXSub() {
      for await (const [topic, data] of xsub) {
        await xpub.send([topic, data])
      }
    }

    async function proxyXPub() {
      for await (const [data] of xpub) {
        await xsub.send([data])
      }
    }
    await Promise.all([
      proxyXSub(),
      proxyXPub()
    ])
  }

}

/*
const pub_addr = 'tcp://127.0.0.1:8800' // publishers send here
const sub_addr = 'tcp://127.0.0.1:8801' // subscribers receive here

async function publisher(i) {
	const sock = new zmq.Publisher

	await sock.connect(pub_addr)
	console.log("Publisher", i, "bound to", pub_addr)

	while (true) { // repeat forever
		await new Promise(resolve => setTimeout(resolve, Math.floor(500 + Math.random() * 1000))) // random timeout to reduce spam
		console.log("Publisher", i, "sending msg")
		await sock.send(["kitty cats", "meeow! it's " + Date.now()])
	}
}

async function subscriber(i) {
	const sock = new zmq.Subscriber

	sock.connect(sub_addr)
	sock.subscribe("kitty cats")
	console.log("Subscriber", i, "connected to", sub_addr)

	for await (const [topic, msg] of sock) {
		console.log("Subscriber", i, "received topic", topic.toString(), "with message", msg.toString())
	}
}
*/

const opt = {
  debug: true,
  xSubPort: 8800,
  xPubPort: 8801,
}

async function main() {
  initProxyHub(opt)
}

main()
