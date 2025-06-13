import { createField } from '../services/auth.js';

export class SignUpElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'min-h-screen flex items-center justify-center px-4';

    const form = document.createElement('form');
    form.id = 'signup-form';
    form.className = 'bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-4';

    const title = document.createElement('h2');
    title.textContent = 'Sign Up';
    title.className = 'text-2xl font-semibold text-center text-gray-800';
    form.appendChild(title);

    // Add fields to form
    form.appendChild(createField('Nickname', 'text', 'nickname', 'nickname'));
    form.appendChild(createField('Age', 'number', 'age', 'age'));
    form.appendChild(createField('Gender', 'select', 'gender', 'gender'));
    form.appendChild(createField('First Name', 'text', 'first-name', 'first-name'));
    form.appendChild(createField('Last Name', 'text', 'last-name', 'last-name'));
    form.appendChild(createField('E-mail', 'email', 'email', 'email'));
    form.appendChild(createField('Password', 'password', 'password', 'password'));

    // Submit button
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Sign Up';
    submit.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition duration-200';
    form.appendChild(submit);

    // Login redirect
    const loginText = document.createElement('p');
    loginText.className = 'text-center text-sm text-gray-600';
    loginText.textContent = 'Already have an account? ';
    const loginLink = document.createElement('a');
    loginLink.className = 'cursor-pointer select-none text-blue-600 hover:underline font-medium';
    loginLink.textContent = 'Log In';
    loginLink.onclick = () => {
      this.remove();
      const signin = document.createElement('c-signin');
      document.querySelector('main').appendChild(signin);
    };
    loginText.appendChild(loginLink);
    form.appendChild(loginText);

    // Append form to container
    container.appendChild(form);
    this.appendChild(container);

    this.handleSubmit();
  }

  handleSubmit() {
    this.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        nickname: this.querySelector('#nickname').value,
        age: this.querySelector('#age').value,
        gender: this.querySelector('#gender').value,
        firstName: this.querySelector('#first-name').value,
        lastName: this.querySelector('#last-name').value,
        email: this.querySelector('#email').value,
        password: this.querySelector('#password').value,
      };
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.code !== 200) {
        // to do
        // display a error msg
        return;
      }

      localStorage.setItem('session_uuid', result.data.session_uuid);
      window.location.href = '/';
    });
  }
}
