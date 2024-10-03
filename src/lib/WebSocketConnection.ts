export class WebsocketConnection {
  private socket;

  constructor(
    webSocketURL: string,
    onMessage: (data: MessageEvent["data"]) => void,
    onOpen?: (socket: WebSocket, e: Event) => void,
    onClose?: (e: Event) => void
  ) {
    try {
      if (!webSocketURL) {
        return;
      }

      this.socket = new WebSocket(webSocketURL);

      this.socket.addEventListener("open", (event) => {
        console.log("WebSocket connection established:");

        if (this.socket) {
          onOpen?.(this.socket, event);
        }
      });

      this.socket.addEventListener("message", (event) => {
        //console.log("Received data:", event.data);
        onMessage(event.data);
      });

      this.socket.addEventListener("close", (event) => {
        //console.error("WebSocket connection closed:", event);
        onClose?.(event);
      });
    } catch (e) {
      console.error(`Connection to ${webSocketURL} failed!`);
      console.error(e);
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getSocket() {
    return this.socket;
  }

  send(data: any) {
    this.socket?.send(JSON.stringify(data));
  }

  close() {
    this.socket?.close();
  }
}
