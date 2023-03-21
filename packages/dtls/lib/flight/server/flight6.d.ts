import { CipherContext } from "../../context/cipher";
import { DtlsContext } from "../../context/dtls";
import { TransportContext } from "../../context/transport";
import { FragmentedHandshake } from "../../record/message/fragment";
import { Flight } from "../flight";
export declare class Flight6 extends Flight {
    private cipher;
    constructor(udp: TransportContext, dtls: DtlsContext, cipher: CipherContext);
    handleHandshake(handshake: FragmentedHandshake): void;
    exec(): Promise<void>;
    private sendChangeCipherSpec;
    private sendFinished;
}
