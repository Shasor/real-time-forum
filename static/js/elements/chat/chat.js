import { state } from '../../main.js';

export class ChatElement extends HTMLElement {
  constructor() {
    super();
    this.usersList = null;
    this.selectedUserLi = null;
    this.convDiv = null;
  }

  connectedCallback() {
    state.user.socket.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'user_list') this.renderUsersList();
    });
    this.render();
  }

  render() {
    this.className = `
    flex w-full max-w-4xl h-[80vh] md:h-[60vh]
    rounded-2xl overflow-hidden bg-white shadow-xl
  `;

    // Liste des utilisateurs
    const usersListDiv = document.createElement('div');
    usersListDiv.className = 'w-1/3 md:w-1/4 h-full bg-gray-100 p-4 overflow-auto';
    this.appendChild(usersListDiv);

    const usersListH2 = document.createElement('h2');
    usersListH2.className = 'text-xl font-bold mb-4 text-center';
    usersListH2.textContent = 'Users';
    usersListDiv.appendChild(usersListH2);

    this.usersList = document.createElement('ul');
    this.usersList.className = 'space-y-3';
    usersListDiv.appendChild(this.usersList);

    this.renderUsersList();
  }

  renderUsersList() {
    const selectedUUID = this.selectedUserLi?.dataset.uuid;
    this.usersList.innerHTML = '';

    if (state.connectedUsers.length === 0) {
      this.usersList.innerHTML = '<p class="text-red-500">Aucun utilisateur connecté !</p>';
      return;
    }

    // Liste des utilisateurs
    for (let user of state.connectedUsers) {
      if (user.nickname === state.user.nickname) continue;

      const userLi = document.createElement('li');
      userLi.className = `
      truncate p-2 text-center bg-white rounded-xl shadow 
      hover:bg-gray-200 cursor-pointer
    `;
      userLi.textContent = user.nickname;
      userLi.title = user.nickname;
      userLi.dataset.uuid = user.uuid;
      this.usersList.appendChild(userLi);

      if (user.uuid === selectedUUID) {
        userLi.classList.add('selected');
        this.selectedUserLi = userLi;
      }

      userLi.addEventListener('click', (e) => {
        // Nettoyage
        this.convDiv?.remove();
        this.selectedUserLi?.classList.remove('selected');
        this.selectedUserLi = e.currentTarget;
        this.selectedUserLi.classList.add('selected');

        // Conversation
        this.convDiv = document.createElement('div');
        this.convDiv.className = 'flex flex-col flex-1 bg-gray-50 p-2';
        this.appendChild(this.convDiv);

        const msgsDiv = document.createElement('div');
        msgsDiv.className = 'flex flex-col flex-1 justify-end p-4 overflow-y-auto space-y-2';
        this.convDiv.appendChild(msgsDiv);

        const input = document.createElement('input');
        input.className = 'flex p-2 border rounded mt-auto';
        input.placeholder = `Write to ${this.selectedUserLi.textContent}...`;
        this.convDiv.appendChild(input);

        state.user.messageHandlers['msg'] = (msg) => {
          if (msg.type !== 'msg' || msg.from !== this.selectedUserLi.dataset.uuid) return;

          const msgElement = document.createElement('c-msg');
          msgElement.content = msg.content;
          msgElement.isSender = false;
          msgsDiv.appendChild(msgElement);
        };

        input.addEventListener('keydown', (e) => {
          const content = input.value.trim();
          if (e.key === 'Enter' && content) {
            const targetUUID = this.selectedUserLi.dataset.uuid;
            state.user.sendMessage(targetUUID, content);
            input.value = '';

            const msgElement = document.createElement('c-msg');
            msgElement.content = content;
            msgsDiv.appendChild(msgElement);
            if (this.selectedUserLi !== this.selectedUserLi.parentElement.firstElementChild) this.renderUsersList();
          }
        });
      });
    }
  }
}
