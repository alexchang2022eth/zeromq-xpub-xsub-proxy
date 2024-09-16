
import zmq from "zeromq"

async function initProxyHub(options) {
  const xSubPort = Number(options.xSubPort) || 3333;
  const xPubPort = Number(options.xPubPort) || 3301;

  const xsub = new zmq.XSubscriber()
  await xsub.bind(`tcp://*:${xSubPort}`)

  const xpub = new zmq.XPublisher()
  await xpub.bind(`tcp://*:${xPubPort}`)

  console.info(`zeromq-xpub-xsub-proxy listening at { xSubPort: ${xSubPort}, xPubPort: ${xPubPort} }`);

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

const opt = {
  xSubPort: 3333,
  xPubPort: 3301,
}

async function main() {
  initProxyHub(opt)
}

main()
