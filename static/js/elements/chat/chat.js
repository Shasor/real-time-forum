import { state } from '../../main.js';
import { fetchMessages } from '../../services/chat.js';

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
        msgsDiv.className = `flex flex-col flex-1 p-4 overflow-y-auto space-y-2`;
        this.convDiv.appendChild(msgsDiv);

        const input = document.createElement('input');
        input.className = 'flex p-2 border rounded mt-auto';
        input.placeholder = `Write to ${this.selectedUserLi.textContent}...`;
        this.convDiv.appendChild(input);

        // add previous msgs
        this.addPrevMsgs(msgsDiv, this.selectedUserLi.dataset.uuid);

        state.user.messageHandlers['msg'] = (msg) => {
          if (msg.type !== 'msg' || msg.from !== this.selectedUserLi.dataset.uuid) return;

          msgsDiv.appendChild(this.createMsg(msg.content, false));
          msgsDiv.scrollTop = msgsDiv.scrollHeight;
        };

        input.addEventListener('keydown', (e) => {
          const content = input.value.trim();
          if (e.key === 'Enter' && content) {
            const targetUUID = this.selectedUserLi.dataset.uuid;
            state.user.sendMessage(targetUUID, content);
            input.value = '';

            msgsDiv.appendChild(this.createMsg(content));
            msgsDiv.scrollTop = msgsDiv.scrollHeight;
            if (this.selectedUserLi !== this.selectedUserLi.parentElement.firstElementChild) this.renderUsersList();
          }
        });
      });
    }
  }

  createMsg(content, isSender = true, time = null) {
    const msgElement = document.createElement('c-msg');
    msgElement.content = content;
    msgElement.isSender = isSender;
    if (time) msgElement.time = new Date(time);
    return msgElement;
  }

  addPrevMsgs(msgsDiv, otherUserUUID) {
    let offset = 0;
    const limit = 10;
    let loading = false;
    let allLoaded = false;

    // loading spinner
    const loadingSpinner = this.createLoadingSpinner();
    msgsDiv.parentElement.insertBefore(loadingSpinner, msgsDiv);
    loadingSpinner.style.display = 'none'; // caché par défaut

    const fetchMessagesAndRender = async () => {
      if (loading || allLoaded) return;
      loading = true;
      loadingSpinner.style.display = 'flex';

      try {
        const messages = await fetchMessages(state.user.uuid, otherUserUUID, offset, limit);

        if (messages.length < limit) allLoaded = true;

        const scrollBottomBefore = msgsDiv.scrollHeight - msgsDiv.scrollTop;

        for (let msg of messages) {
          const isSender = msg.from === state.user.uuid;
          const msgElement = this.createMsg(msg.content, isSender, msg.time);
          msgsDiv.insertBefore(msgElement, msgsDiv.firstChild);
        }

        offset += messages.length;
        msgsDiv.scrollTop = msgsDiv.scrollHeight - scrollBottomBefore;
      } catch (err) {
        console.error('Erreur lors du fetch des messages :', err);
      } finally {
        loading = false;
        setTimeout(() => {
          loadingSpinner.style.display = 'none';
        }, 500);
      }
    };

    let lastTime = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - lastTime >= 500 && msgsDiv.scrollTop < 50) {
        lastTime = now;
        fetchMessagesAndRender();
      }
    };

    msgsDiv.addEventListener('scroll', onScroll);
    fetchMessagesAndRender();
  }

  createLoadingSpinner() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `
    flex items-center justify-center bg-indigo-500 text-white text-sm font-medium 
    py-1 px-3 rounded shadow disabled:opacity-50 mt-2 self-center fixed
  `;
    button.disabled = true;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList = 'mr-2 size-4 animate-spin fill-white';
    svg.setAttribute('viewBox', '0 0 24 24');

    svg.innerHTML = `
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
  `;

    const span = document.createElement('span');
    span.textContent = 'Chargement…';

    button.appendChild(svg);
    button.appendChild(span);
    return button;
  }
}
