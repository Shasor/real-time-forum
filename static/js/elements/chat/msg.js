export class MsgElement extends HTMLElement {
  constructor() {
    super();
    this.content = null;
    this.isSender = true;
    this.time = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this.isSender) this.className = 'self-end';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-center gap-2`;
    this.appendChild(msgDiv);
    // time
    const timeSpan = document.createElement('span');
    timeSpan.className = '';
    const now = new Date();
    const isValidDate = this.time instanceof Date;
    const usedTime = isValidDate ? this.time : now;
    // Si time est défini mais invalide → erreur
    if (this.time != null && !isValidDate) {
      timeSpan.textContent = 'error';
    } else {
      const isToday = usedTime.toDateString() === now.toDateString();
      timeSpan.textContent = isToday
        ? usedTime.toTimeString().slice(0, 5) // "HH:MM"
        : `${usedTime.toLocaleString('default', { month: 'long' })}, ${String(usedTime.getDate()).padStart(2, '0')}`;
    }
    msgDiv.appendChild(timeSpan);
    // content
    const msgContent = document.createElement('div');
    msgContent.className = `w-fit p-2 rounded-xl ${this.isSender ? 'bg-red-400' : 'bg-blue-400'}`;
    msgContent.textContent = this.content;
    msgDiv.appendChild(msgContent);
  }
}
