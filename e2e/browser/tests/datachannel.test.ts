import { WebSocketTransport, Peer } from "protoo-client";

const transport = new WebSocketTransport("ws://localhost:8886");
const peer = new Peer(transport);

describe("datachannel", () => {
  it(
    "answer",
    async (done) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      const offer = await peer.request("datachannel_answer", { type: "init" });
      await pc.setRemoteDescription(offer);
      await pc.setLocalDescription(await pc.createAnswer());

      pc.ondatachannel = ({ channel }) => {
        channel.send("ping");
        channel.onmessage = ({ data }) => {
          expect(data).toBe("ping" + "pong");
          console.warn("answer", "succeed");
          done();
        };
      };

      pc.onicecandidate = ({ candidate }) => {
        peer.request("datachannel_answer", {
          type: "candidate",
          payload: candidate,
        });
      };

      peer.request("datachannel_answer", {
        type: "answer",
        payload: pc.localDescription,
      });
    },
    10 * 1000
  );

  it(
    "offer",
    async (done) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      const channel = pc.createDataChannel("dc");
      channel.onopen = () => {
        channel.send("ping");
      };
      channel.onmessage = ({ data }) => {
        expect(data).toBe("ping" + "pong");
        console.warn("offer", "succeed");
        done();
      };
      pc.onicecandidate = ({ candidate }) => {
        peer.request("datachannel_offer", {
          type: "candidate",
          payload: candidate,
        });
      };

      await pc.setLocalDescription(await pc.createOffer());
      const answer = await peer.request("datachannel_offer", {
        type: "init",
        payload: pc.localDescription,
      });
      await pc.setRemoteDescription(answer);
    },
    10 * 1000
  );
});
