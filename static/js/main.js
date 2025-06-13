import { AppElement } from './elements/app.js';
import { CategoriesElement } from './elements/categories.js';
import { CategoryButton } from './elements/category.js';
import { ChatElement } from './elements/chat/chat.js';
import { MsgElement } from './elements/chat/msg.js';
import { CreatePostElement } from './elements/create-post.js';
import { HeaderElement } from './elements/header.js';
import { ModalElement } from './elements/modal.js';
import { NavBarButtonElement } from './elements/navbar-button.js';
import { NavBarElement } from './elements/navbar.js';
import { PostElement } from './elements/post.js';
import { PostsElement } from './elements/posts.js';
import { CommentsElement } from './elements/comments.js';
import { SignInElement } from './elements/signin.js';
import { SignUpElement } from './elements/signup.js';
import { SpacingElement } from './elements/spacing.js';
import { User } from './models/user.js';
import { getPosts } from './services/post.js';

export const state = {
  user: new User(localStorage.getItem('session_uuid')),
  posts: await getPosts(),
};

document.body.appendChild(document.createElement('c-app'));

customElements.define('c-app', AppElement);
customElements.define('c-header', HeaderElement);
customElements.define('c-categories', CategoriesElement);
customElements.define('c-category', CategoryButton);
customElements.define('c-posts', PostsElement);
customElements.define('c-post', PostElement);
customElements.define('c-comments', CommentsElement);
customElements.define('c-navbar', NavBarElement);
customElements.define('c-navbutton', NavBarButtonElement);
customElements.define('c-signup', SignUpElement);
customElements.define('c-signin', SignInElement);
customElements.define('c-createpost', CreatePostElement);
// chat elements
customElements.define('c-chat', ChatElement);
customElements.define('c-msg', MsgElement);
//
customElements.define('c-spacing', SpacingElement);
customElements.define('c-modal', ModalElement);
