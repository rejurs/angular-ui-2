export interface ScaleProps {

    type        : string;
    width       : string;
    height      : string;
    barWidth    : string;
    barHeight   : string;
    group       : number;           // group by seconds/minutes
    labels      : Array<number>;    // full list of labels
    show        : Array<number>;    // list of labels to be displayed
    showAs      : Array<string>;    // display labels as
}