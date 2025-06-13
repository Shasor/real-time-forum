import { categories } from '../models/category.js';

export class CategoriesElement extends HTMLElement {
  constructor() {
    super();
    // create section
    const section = document.createElement('section');
    section.classList = 'max-w-5xl px-4 m-auto flex flex-col md:flex-row items-center gap-5';
    // add categories elements
    categories.forEach((text) => {
      const button = document.createElement('c-category');
      button.textContent = text;
      section.appendChild(button);
    });
    this.appendChild(section);
  }
}
