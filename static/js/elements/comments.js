import { state } from '../main.js';
import { getComments, createComment } from '../services/post.js';

export class CommentsElement extends HTMLElement {
  connectedCallback() {
    this.postUUID = this.getAttribute('post-uuid');
    this.load();
  }

  async load() {
    this.comments = await getComments(this.postUUID);
    this.render();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const textarea = this.querySelector('textarea');
    const content = textarea.value.trim();
    if (!content) return;
    const postUUID = this.postUUID || this.getAttribute('post-uuid');
    const data = {
      user: {
        uuid: state.user.uuid,
        isConnected: state.user.isConnected,
      },
      content,
      post_uuid: postUUID,
    };
    await createComment(data);
    textarea.value = '';
    this.comments = await getComments(postUUID);
    this.render();
  }

  render() {
    this.innerHTML = '';
    this.className = 'flex flex-col w-full max-w-xl bg-white rounded-xl shadow-xl p-4 max-h-[80vh] overflow-y-auto';

    const list = document.createElement('div');
    list.className = 'flex flex-col space-y-2';
    if (Array.isArray(this.comments)) {
      for (let c of this.comments) {
        const div = document.createElement('div');
        div.className = 'p-2 bg-gray-100 rounded';
        div.textContent = `${c.user.nickname}: ${c.content}`;
        list.appendChild(div);
      }
    }
    this.appendChild(list);

    const form = document.createElement('form');
    form.className = 'mt-4 flex';
    const textarea = document.createElement('textarea');
    textarea.className = 'flex-grow border rounded mr-2';
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Send';
    button.className = 'bg-blue-500 text-white px-3 rounded';
    form.appendChild(textarea);
    form.appendChild(button);
    this.appendChild(form);
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
}