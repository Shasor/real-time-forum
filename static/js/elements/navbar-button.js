export class NavBarButtonElement extends HTMLElement {
  constructor() {
    super();
    Object.assign(this.style, {
      display: 'inline-block',
      height: '2rem',
      width: '2rem',
      backgroundImage: `url('${this.img}')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      cursor: 'pointer',
      padding: '10px',
    });
    this.onmouseover = () => (this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)');
    this.onmouseout = () => (this.style.boxShadow = 'none');
    this.addEventListener('click', () => {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    });
  }
}
