import { state } from '../main.js';
import { categories } from '../models/category.js';
import { createPost } from '../services/post.js';

export class CreatePostElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        content: this.querySelector('textarea').value,
        category: this.querySelector('select').value,
        user: state.user,
      };
      createPost(data);
    });
  }

  render() {
    this.className = `
    flex rounded-2xl overflow-hidden bg-white shadow-xl
  `;
    const form = document.createElement('form');
    form.className = 'flex flex-col justify-center items-start w-full h-full p-2.5';

    // textarea
    const content = document.createElement('textarea');
    content.placeholder = 'I love life!';
    content.style.resize = 'none';
    content.className = 'rounded-lg p-1 m-1 border border-gray-300 w-full'; // ajoute border et largeur full pour meilleure UI
    form.appendChild(content);

    // categories
    const select_label = document.createElement('label');
    select_label.textContent = 'Category: ';
    select_label.className = 'm-1';

    const select = document.createElement('select');
    select.className = 'rounded-full p-1 m-1 border border-gray-300';
    for (let category of categories) {
      const option = document.createElement('option');
      option.textContent = category;
      option.value = category;
      select.appendChild(option);
    }
    select_label.appendChild(select);
    form.appendChild(select_label);

    // submit
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Send!';
    button.className = 'w-1/2 self-center rounded-full p-1 m-1 bg-blue-500 text-white hover:bg-blue-600 transition';
    form.appendChild(button);

    this.appendChild(form);
  }
}
