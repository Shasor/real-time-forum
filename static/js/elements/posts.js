import { state } from '../main.js';

export class PostsElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Check if Posts are ok
    if (!Array.isArray(state.posts)) {
      alert('no post');
      return;
    }
    // Reset le contenu à chaque appel de render pour ne pas ajouter plusieurs fois les mêmes éléments
    this.innerHTML = '';
    // create section
    const section = document.createElement('section');
    section.classList = 'max-w-5xl p-4 m-auto place-items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';
    // add categories elements
    for (let post of state.posts) {
      const box = document.createElement('c-post');
      box.Content = post.content;
      box.UUID = post.uuid;
      section.appendChild(box);
    }
    this.appendChild(section);
  }
}
