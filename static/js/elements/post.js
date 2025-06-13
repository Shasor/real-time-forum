export class PostElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEventListener('click', () => {
      const existingModal = document.querySelector('c-modal');
      if (existingModal) existingModal.remove();
      const modal = document.createElement('c-modal');
      const comments = document.createElement('c-comments');
      comments.setAttribute('post-uuid', this.UUID);
      modal.appendChild(comments);
      document.querySelector('main').appendChild(modal);
    });
  }

  render() {
    this.className = `
      relative flex flex-col w-[246px] h-[160px]
      rounded-xl border border-white
      bg-[rgba(209,196,233,0.29)] backdrop-blur-[11px]
      shadow-md overflow-hidden
    `;

    const image = document.createElement('div');
    const randomUrl = `https://random.danielpetrica.com/api/random?format=thumb&random=${Math.floor(Math.random() * 10000)}`;
    image.className = `
      absolute top-[10px] left-[10px]
      w-[226px] h-[115px]
      rounded-xl
      bg-cover bg-center
    `;
    image.style.backgroundImage = `url(${randomUrl})`;

    const avatar = document.createElement('div');
    avatar.className = `
      absolute top-[130px] left-[10px]
      w-[24px] h-[24px]
      rounded-full bg-cover
    `;
    avatar.style.backgroundImage = `url('../../assets/profil.jpeg')`;

    const title = document.createElement('div');
    title.textContent = this.Content;
    title.className = `
      absolute top-[132px] left-[44px]
      text-white font-medium text-[16px] leading-[24px]
      font-[Poppins,sans-serif] truncate max-w-[75%]
    `;

    this.appendChild(image);
    this.appendChild(avatar);
    this.appendChild(title);
  }
}
