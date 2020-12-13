import { RTCPeerConnection, RtpTrack } from "../../src";
import { Server } from "ws";
import { OpusEncoder } from "@discordjs/opus";
import { RtpHeader, RtpPacket } from "../../src/vendor/rtp";
import { Mixer } from "./mixing";
import { random16, random32, uint16Add, uint32Add } from "../../src/utils";

console.log("start");
const server = new Server({ port: 8888 });

server.on("connection", async (socket) => {
  const encoder = new OpusEncoder(48000, 2);
  const mixer = new Mixer();
  console.log("onconnect");

  function send(type: string, payload: any) {
    socket.send(JSON.stringify({ type, payload }));
  }

  const pc = new RTCPeerConnection({
    stunServer: ["stun.l.google.com", 19302],
  });
  const sender = pc.addTransceiver("audio", "sendonly");

  const tracks: {
    [msid: string]: RtpTrack;
  } = {};
  const disposers: {
    [msid: string]: () => void;
  } = {};

  socket.onmessage = async (ev) => {
    const { type, payload } = JSON.parse(ev.data as string);
    console.log("onmessage", type);
    switch (type) {
      case "answer":
        {
          const { sdp } = payload;
          pc.setRemoteDescription(sdp);
        }
        break;
      case "candidate":
        {
          const { candidate } = payload;
          pc.addIceCandidate(candidate);
        }
        break;
      case "publish":
        {
          const transceiver = pc.addTransceiver("audio", "recvonly");
          transceiver.onTrack.once((track) => {
            tracks[transceiver.msid] = track;
          });
          send("onPublish", { id: transceiver.msid });
          await pc.setLocalDescription(pc.createOffer());
          send("offer", { sdp: pc.localDescription });
        }
        break;
      case "add":
        {
          const { id } = payload;
          const track = tracks[id];
          const input = mixer.input();
          const { unSubscribe } = track.onRtp.subscribe((packet) => {
            const decoded = encoder.decode(packet.payload);
            input.write(decoded);
          });
          disposers[id] = () => {
            unSubscribe();
            input.remove();
          };
        }
        break;
      case "remove":
        {
          const { id } = payload;
          disposers[id]();
          delete disposers[id];
        }
        break;
    }
  };

  let sequenceNumber = random16();
  let timestamp = random32();
  mixer.onData = (data) => {
    const encoded = encoder.encode(data);

    sequenceNumber = uint16Add(sequenceNumber, 1);
    timestamp = uint32Add(timestamp, 960n);

    const header = new RtpHeader({
      sequenceNumber,
      timestamp: Number(timestamp),
      payloadType: 96,
      extension: true,
      marker: false,
      padding: false,
    });
    const rtp = new RtpPacket(header, encoded);
    sender.sendRtp(rtp);
  };

  await pc.setLocalDescription(pc.createOffer());
  send("offer", { sdp: pc.localDescription });
});
