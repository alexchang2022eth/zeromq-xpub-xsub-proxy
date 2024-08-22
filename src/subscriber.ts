import zmq from "zeromq"

const sub_addr = 'tcp://127.0.0.1:3301' // subscribers receive here

async function subscriber(i) {
  const sock = new zmq.Subscriber({
      receiveHighWaterMark: 10000,
  })
  
  sock.connect(sub_addr)
  sock.subscribe("global-notification")
  console.log("Subscriber", i, "connected to", sub_addr)
  
  for await (const [topic, msg] of sock) {
  	console.log("Subscriber", i, "received topic", topic.toString(), "with message", msg.toString())
  }
}

async function main() {
    await subscriber(1)
}

main()
