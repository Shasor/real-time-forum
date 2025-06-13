export class HeaderElement extends HTMLElement {
  constructor() {
    super();

    const header = document.createElement('header');
    header.className = 'sticky top-0 z-10 py-4';

    const section = document.createElement('section');
    section.className = 'max-w-5xl px-4 mx-auto flex items-center gap-5';

    const h1 = document.createElement('h1');
    h1.innerText = 'YouTalk';
    h1.className = 'text-3xl font-medium text-white backdrop-blur-md shadow-md bg-[rgba(209,196,233,0.29)] px-4 py-2 border border-white rounded-full';

    section.appendChild(h1);
    header.appendChild(section);
    this.appendChild(header);
  }
}
