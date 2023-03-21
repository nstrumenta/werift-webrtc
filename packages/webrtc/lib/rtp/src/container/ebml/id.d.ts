/**
 * @see https://www.matroska.org/technical/specs/index.html
 */
export declare const ID: {
    EBML: Uint8Array;
    EBMLVersion: Uint8Array;
    EBMLReadVersion: Uint8Array;
    EBMLMaxIDLength: Uint8Array;
    EBMLMaxSizeLength: Uint8Array;
    DocType: Uint8Array;
    DocTypeVersion: Uint8Array;
    DocTypeReadVersion: Uint8Array;
    Void: Uint8Array;
    CRC32: Uint8Array;
    Segment: Uint8Array;
    SeekHead: Uint8Array;
    Seek: Uint8Array;
    SeekID: Uint8Array;
    SeekPosition: Uint8Array;
    Info: Uint8Array;
    SegmentUID: Uint8Array;
    SegmentFilename: Uint8Array;
    PrevUID: Uint8Array;
    PrevFilename: Uint8Array;
    NextUID: Uint8Array;
    NextFilename: Uint8Array;
    SegmentFamily: Uint8Array;
    ChapterTranslate: Uint8Array;
    ChapterTranslateEditionUID: Uint8Array;
    ChapterTranslateCodec: Uint8Array;
    ChapterTranslateID: Uint8Array;
    TimecodeScale: Uint8Array;
    Duration: Uint8Array;
    DateUTC: Uint8Array;
    Title: Uint8Array;
    MuxingApp: Uint8Array;
    WritingApp: Uint8Array;
    Cluster: Uint8Array;
    Timecode: Uint8Array;
    SilentTracks: Uint8Array;
    SilentTrackNumber: Uint8Array;
    Position: Uint8Array;
    PrevSize: Uint8Array;
    SimpleBlock: Uint8Array;
    BlockGroup: Uint8Array;
    Block: Uint8Array;
    BlockAdditions: Uint8Array;
    BlockMore: Uint8Array;
    BlockAddID: Uint8Array;
    BlockAdditional: Uint8Array;
    BlockDuration: Uint8Array;
    ReferencePriority: Uint8Array;
    ReferenceBlock: Uint8Array;
    CodecState: Uint8Array;
    DiscardPadding: Uint8Array;
    Slices: Uint8Array;
    TimeSlice: Uint8Array;
    LaceNumber: Uint8Array;
    Tracks: Uint8Array;
    TrackEntry: Uint8Array;
    TrackNumber: Uint8Array;
    TrackUID: Uint8Array;
    TrackType: Uint8Array;
    FlagEnabled: Uint8Array;
    FlagDefault: Uint8Array;
    FlagForced: Uint8Array;
    FlagLacing: Uint8Array;
    MinCache: Uint8Array;
    MaxCache: Uint8Array;
    DefaultDuration: Uint8Array;
    DefaultDecodedFieldDuration: Uint8Array;
    MaxBlockAdditionID: Uint8Array;
    Name: Uint8Array;
    Language: Uint8Array;
    CodecID: Uint8Array;
    CodecPrivate: Uint8Array;
    CodecName: Uint8Array;
    AttachmentLink: Uint8Array;
    CodecDecodeAll: Uint8Array;
    TrackOverlay: Uint8Array;
    CodecDelay: Uint8Array;
    SeekPreRoll: Uint8Array;
    TrackTranslate: Uint8Array;
    TrackTranslateEditionUID: Uint8Array;
    TrackTranslateCodec: Uint8Array;
    TrackTranslateTrackID: Uint8Array;
    Video: Uint8Array;
    FlagInterlaced: Uint8Array;
    FieldOrder: Uint8Array;
    StereoMode: Uint8Array;
    AlphaMode: Uint8Array;
    PixelWidth: Uint8Array;
    PixelHeight: Uint8Array;
    PixelCropBottom: Uint8Array;
    PixelCropTop: Uint8Array;
    PixelCropLeft: Uint8Array;
    PixelCropRight: Uint8Array;
    DisplayWidth: Uint8Array;
    DisplayHeight: Uint8Array;
    DisplayUnit: Uint8Array;
    AspectRatioType: Uint8Array;
    ColourSpace: Uint8Array;
    Colour: Uint8Array;
    MatrixCoefficients: Uint8Array;
    BitsPerChannel: Uint8Array;
    ChromaSubsamplingHorz: Uint8Array;
    ChromaSubsamplingVert: Uint8Array;
    CbSubsamplingHorz: Uint8Array;
    CbSubsamplingVert: Uint8Array;
    ChromaSitingHorz: Uint8Array;
    ChromaSitingVert: Uint8Array;
    Range: Uint8Array;
    TransferCharacteristics: Uint8Array;
    Primaries: Uint8Array;
    MaxCLL: Uint8Array;
    MaxFALL: Uint8Array;
    MasteringMetadata: Uint8Array;
    PrimaryRChromaticityX: Uint8Array;
    PrimaryRChromaticityY: Uint8Array;
    PrimaryGChromaticityX: Uint8Array;
    PrimaryGChromaticityY: Uint8Array;
    PrimaryBChromaticityX: Uint8Array;
    PrimaryBChromaticityY: Uint8Array;
    WhitePointChromaticityX: Uint8Array;
    WhitePointChromaticityY: Uint8Array;
    LuminanceMax: Uint8Array;
    LuminanceMin: Uint8Array;
    Audio: Uint8Array;
    SamplingFrequency: Uint8Array;
    OutputSamplingFrequency: Uint8Array;
    Channels: Uint8Array;
    BitDepth: Uint8Array;
    TrackOperation: Uint8Array;
    TrackCombinePlanes: Uint8Array;
    TrackPlane: Uint8Array;
    TrackPlaneUID: Uint8Array;
    TrackPlaneType: Uint8Array;
    TrackJoinBlocks: Uint8Array;
    TrackJoinUID: Uint8Array;
    ContentEncodings: Uint8Array;
    ContentEncoding: Uint8Array;
    ContentEncodingOrder: Uint8Array;
    ContentEncodingScope: Uint8Array;
    ContentEncodingType: Uint8Array;
    ContentCompression: Uint8Array;
    ContentCompAlgo: Uint8Array;
    ContentCompSettings: Uint8Array;
    ContentEncryption: Uint8Array;
    ContentEncAlgo: Uint8Array;
    ContentEncKeyID: Uint8Array;
    ContentSignature: Uint8Array;
    ContentSigKeyID: Uint8Array;
    ContentSigAlgo: Uint8Array;
    ContentSigHashAlgo: Uint8Array;
    Cues: Uint8Array;
    CuePoint: Uint8Array;
    CueTime: Uint8Array;
    CueTrackPositions: Uint8Array;
    CueTrack: Uint8Array;
    CueClusterPosition: Uint8Array;
    CueRelativePosition: Uint8Array;
    CueDuration: Uint8Array;
    CueBlockNumber: Uint8Array;
    CueCodecState: Uint8Array;
    CueReference: Uint8Array;
    CueRefTime: Uint8Array;
    Attachments: Uint8Array;
    AttachedFile: Uint8Array;
    FileDescription: Uint8Array;
    FileName: Uint8Array;
    FileMimeType: Uint8Array;
    FileData: Uint8Array;
    FileUID: Uint8Array;
    Chapters: Uint8Array;
    EditionEntry: Uint8Array;
    EditionUID: Uint8Array;
    EditionFlagHidden: Uint8Array;
    EditionFlagDefault: Uint8Array;
    EditionFlagOrdered: Uint8Array;
    EncryptionAlgorithm: Uint8Array;
    EncryptionKeyID: Uint8Array;
    ContentEncAESSettings: Uint8Array;
    AESSettingsCipherMode: Uint8Array;
    ChapterAtom: Uint8Array;
    ChapterUID: Uint8Array;
    ChapterStringUID: Uint8Array;
    ChapterTimeStart: Uint8Array;
    ChapterTimeEnd: Uint8Array;
    ChapterFlagHidden: Uint8Array;
    ChapterFlagEnabled: Uint8Array;
    ChapterSegmentUID: Uint8Array;
    ChapterSegmentEditionUID: Uint8Array;
    ChapterPhysicalEquiv: Uint8Array;
    ChapterTrack: Uint8Array;
    ChapterTrackNumber: Uint8Array;
    ChapterDisplay: Uint8Array;
    ChapString: Uint8Array;
    ChapLanguage: Uint8Array;
    ChapCountry: Uint8Array;
    ChapProcess: Uint8Array;
    ChapProcessCodecID: Uint8Array;
    ChapProcessPrivate: Uint8Array;
    ChapProcessCommand: Uint8Array;
    ChapProcessTime: Uint8Array;
    ChapProcessData: Uint8Array;
    Tags: Uint8Array;
    Tag: Uint8Array;
    Targets: Uint8Array;
    TargetTypeValue: Uint8Array;
    TargetType: Uint8Array;
    TagTrackUID: Uint8Array;
    TagEditionUID: Uint8Array;
    TagChapterUID: Uint8Array;
    TagAttachmentUID: Uint8Array;
    SimpleTag: Uint8Array;
    TagName: Uint8Array;
    TagLanguage: Uint8Array;
    TagDefault: Uint8Array;
    TagString: Uint8Array;
    TagBinary: Uint8Array;
};
