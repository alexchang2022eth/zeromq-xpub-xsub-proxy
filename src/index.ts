
import zmq from "zeromq"

import zmqPackageJson from 'zeromq/package.json' assert { type: "json"}

const version = zmqPackageJson.version

async function initProxyHub(options) {
  const xSubPort = Number(options.xSubPort) || 3333;
  const xPubPort = Number(options.xPubPort) || 3301;

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
    xsub.on('message', (topic, data) => xpub.send([topic, data]));

    // Subscription pump
    xpub.on('message', (data) => xsub.send(data));

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

const opt = {
  debug: true,
  xSubPort: 3333,
  xPubPort: 3301,
}

async function main() {
  initProxyHub(opt)
}

main()
