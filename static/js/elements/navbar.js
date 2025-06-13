import { state } from '../main.js';

export class NavBarElement extends HTMLElement {
  constructor() {
    super();

    this.className = `
      fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000]
      flex items-center justify-around
      w-full max-w-5xl h-16
      rounded-lg border border-white
      shadow-md backdrop-blur-md
      bg-[rgba(209,196,233,0.29)]
    `;

    const profil = document.createElement('div');
    profil.className = `
      w-10 h-10 rounded-full bg-cover bg-center
    `;
    profil.style.backgroundImage = 'url("../../assets/profil.jpeg")';
    this.appendChild(profil);

    const usersBtn = document.createElement('c-navbutton');
    usersBtn.onClick = () => this.toggleChat();
    usersBtn.img = '../../assets/navbar-users.webp';
    this.appendChild(usersBtn);

    const addPostBtn = document.createElement('c-navbutton');
    addPostBtn.onClick = () => this.toggleCreatePost();
    addPostBtn.img = '../../assets/addPostBtn.webp';
    this.appendChild(addPostBtn);

    const test = document.createElement('div');
    test.className = `
      bg-red-500 h-3/5 w-2/3
    `;
    this.appendChild(test);

    const notifsBtn = document.createElement('c-navbutton');
    notifsBtn.onClick = () => displayNotifs(); // TODO
    notifsBtn.img = '../../assets/navbar-bell.webp';
    this.appendChild(notifsBtn);

    const loginBtn = document.createElement('c-navbutton');
    loginBtn.onClick = () => state.user.logout();
    loginBtn.img = '../../assets/navbar-connect.webp';
    this.appendChild(loginBtn);
  }

  toggleChat() {
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
