import { state } from '../main.js';

export class NavBarElement extends HTMLElement {
  constructor() {
    super();
    this.notifDiv = null;
  }

  connectedCallback() {
    this.render();
    state.user.messageHandlers['notif'] = () => {
      this.notifDiv.classList.remove('hidden');
    };
  }

  render() {
    this.className = `
      max-sm:fixed max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:bottom-5 mb-5 z-[1000] self-center
      flex items-center justify-around
      w-auto max-w-5xl h-16 p-3 space-x-4
      rounded-lg border border-white
      shadow-md backdrop-blur-md
      bg-[rgba(209,196,233,0.29)]
    `;

    const profil = document.createElement('div');
    profil.className = 'w-10 h-10 rounded-full bg-cover bg-center';
    profil.style.backgroundImage = 'url("../../assets/profil.jpeg")';
    this.appendChild(profil);

    const chatDiv = document.createElement('div');
    chatDiv.className = 'relative';
    // chat button
    const chatBtn = document.createElement('c-navbutton');
    chatBtn.onClick = () => this.toggleChat();
    chatBtn.img = '../../assets/navbar-users.webp';
    chatDiv.appendChild(chatBtn);
    // notif
    this.notifDiv = document.createElement('div');
    this.notifDiv.className = 'bg-red-500 w-4 h-4 absolute -top-1 -right-1 rounded-full object-contain hidden';
    chatDiv.appendChild(this.notifDiv);
    this.appendChild(chatDiv);

    const addPostBtn = document.createElement('c-navbutton');
    addPostBtn.onClick = () => this.toggleCreatePost();
    addPostBtn.img = '../../assets/addPostBtn.webp';
    this.appendChild(addPostBtn);

    const loginBtn = document.createElement('c-navbutton');
    loginBtn.onClick = () => state.user.logout();
    loginBtn.img = '../../assets/navbar-connect.webp';
    this.appendChild(loginBtn);
  }

  toggleChat() {
    // remove notif
    this.notifDiv?.classList.add('hidden');
    // checks if a modal is already open
    const existingModal = document.querySelector('c-modal');
    if (existingModal) {
      existingModal.remove();
      if (existingModal.firstElementChild.tagName.toLowerCase() === 'c-chat') return;
    }
    // create modal and chat
    const modal = document.createElement('c-modal');
    const chat = document.createElement('c-chat');
    modal.appendChild(chat);
    document.querySelector('main').appendChild(modal);
  }

  toggleCreatePost() {
    // checks if a modal is already open
    const existingModal = document.querySelector('c-modal');
    if (existingModal) {
      existingModal.remove();
      if (existingModal.firstElementChild.tagName.toLowerCase() === 'c-createpost') return;
    }
    // create modal and chat
    const modal = document.createElement('c-modal');
    const chat = document.createElement('c-createpost');
    modal.appendChild(chat);
    document.querySelector('main').appendChild(modal);
  }
}
