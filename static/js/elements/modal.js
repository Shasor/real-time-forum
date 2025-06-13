export class ModalElement extends HTMLElement {
  constructor() {
    super();
    this.handleEscape = this.handleEscape.bind(this);
  }

  connectedCallback() {
    this.render();
    document.body.style.overflow = 'hidden';
    this.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('keydown', this.handleEscape);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleEscape);
    document.body.style.overflow = ''; // restaure scroll si tu veux bloquer scroll lors de l'ouverture modal
  }

  handleClick(e) {
    if (e.target === this) this.remove();
  }

  handleEscape(e) {
    if (e.code === 'Escape') this.remove();
  }

  render() {
    this.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
  }
}
