import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import * as io from "socket.io-client";

@Injectable()

/**
 * Socket
 */
export class Socket {

    private url: string = 'http://localhost:5000';
    private socket: any;

    public socketData: Subject<any> = new Subject<any>();

    constructor() { }

    /**
     * Connect
     */
    connect() {

        this.socket = io.connect(this.url);

        let that: any = this;

        this.socket.on('topic/geo', function(data) {
            
            that.socketData.next(data.message);
        });
    }
}