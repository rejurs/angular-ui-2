export interface ScaleProps {

    type        : string;           // type of scale
    width       : string;           // scale width
    height      : string;           // scale height
    barWidth    : string;           // bar width
    barHeight   : string;           // bar height
    group       : number;           // group by seconds/minutes
    labels      : Array<number>;    // full list of labels
    show        : Array<number>;    // list of labels to be displayed
    showAs      : Array<string>;    // display labels as
}