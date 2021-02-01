import {
  RTCPeerConnection,
  RTCRtpCodecParameters,
  useAbsSendTime,
  useTransportWideCC,
} from "../../../packages/webrtc/src";
import { Server } from "ws";
import { Event } from "rx.mini";

const server = new Server({ port: 8888 });
console.log("start");

server.on("connection", async (socket) => {
  const onMessage = new Event<[any]>();
  socket.on("message", (data: any) => {
    onMessage.execute(data);
  });

  const receiver = new RTCPeerConnection({
    codecs: {
      video: [
        new RTCRtpCodecParameters({
          mimeType: "video/VP8",
          clockRate: 90000,
          rtcpFeedback: [
            { type: "ccm", parameter: "fir" },
            { type: "nack" },
            { type: "nack", parameter: "pli" },
            { type: "goog-remb" },
          ],
        }),
      ],
    },
    headerExtensions: { video: [useAbsSendTime()] },
  });
  const sender = new RTCPeerConnection({
    codecs: {
      video: [
        new RTCRtpCodecParameters({
          mimeType: "video/VP8",
          clockRate: 90000,
          rtcpFeedback: [
            { type: "ccm", parameter: "fir" },
            { type: "nack" },
            { type: "nack", parameter: "pli" },
            { type: "goog-remb" },
            { type: "transport-cc" },
          ],
        }),
      ],
    },
    headerExtensions: { video: [useAbsSendTime(), useTransportWideCC()] },
  });
  const receiverTransceiver = receiver.addTransceiver("video", "recvonly");
  const senderTransceiver = sender.addTransceiver("video", "sendonly");

  receiverTransceiver.onTrack.subscribe(async (track) => {
    const [rtp] = await track.onRtp.asPromise();
    setInterval(() => {
      receiverTransceiver.receiver.sendRtcpPLI(rtp.header.ssrc);
    }, 3000);
    track.onRtp.subscribe((rtp) => {
      senderTransceiver.sendRtp(rtp);
    });
  });

  {
    const offer = receiver.createOffer();
    await receiver.setLocalDescription(offer);
    socket.send(JSON.stringify(receiver.localDescription));
    const [data] = await onMessage.asPromise();
    receiver.setRemoteDescription(JSON.parse(data));
  }

  {
    await sender.setLocalDescription(sender.createOffer());
    socket.send(JSON.stringify(sender.localDescription));
    const [data] = await onMessage.asPromise();
    sender.setRemoteDescription(JSON.parse(data));
  }
});
