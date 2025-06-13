export class User {
  constructor(session_uuid) {
    this.uuid = null;
    this.session_uuid = session_uuid || null;
    this.nickname = null;
    this.age = null;
    this.gender = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.isConnected = false;
    this.socket = null;
    if (session_uuid != null) this.getSession();
  }

  async getSession() {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_uuid: this.session_uuid }),
      });
      const result = await res.json();
      if (result.code !== 200 || !result.data?.user) {
        localStorage.removeItem('session_uuid');
        return;
      }
      const resUser = result.data.user;
      this.uuid = resUser.uuid;
      this.nickname = resUser.nickname;
      this.age = resUser.age;
      this.gender = resUser.gender;
      this.firstName = resUser.firstName;
      this.lastName = resUser.lastName;
      this.email = resUser.email;
      this.isConnected = true;
      this.initWS();
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'utilisateur :", error);
    }
  }

  initWS() {
    const socket = new WebSocket('/ws');
    socket.onopen = () => {
      this.socket = socket;
      this.socket.send(this.session_uuid);
      console.log('Websocket opened!');
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    socket.onclose = () => {
      this.socket = null;
      console.log('Websocket closed!');
    };
  }

  sendMessage(toUUID, content) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket n'est pas connecté");
      return;
    }
    const msg = {
      from: this.uuid,
      to: toUUID,
      content,
      time: Date.now(),
    };
    this.socket.send(JSON.stringify(msg));
  }

  logout() {
    localStorage.removeItem('session_uuid');
    window.location.href = '/';
  }
}
