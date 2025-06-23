import { state } from '../main.js';
import { getPosts } from '../services/post.js';

export class PostsElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.className = 'flex flex-col sm:h-0 flex-1 items-center';
    // Check if Posts are ok
    if (state.posts.length < 1) {
      alert('no post');
      return;
    }
    // Reset le contenu à chaque appel de render pour ne pas ajouter plusieurs fois les mêmes éléments
    this.innerHTML = '';
    // create section
    const section = document.createElement('section');
    section.classList = 'max-w-5xl p-4 pb-20 place-items-center overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';
    // add categories elements
    for (let post of state.posts) {
      section.appendChild(this.createPost(post.uuid, post.content));
    }
    this.appendChild(section);
    this.handleScroll(section);
  }

  createPost(uuid, content) {
    const post = document.createElement('c-post');
    post.UUID = uuid;
    post.Content = content;
    return post;
  }

  handleScroll(section) {
    let offset = 0;
    const limit = 8;
    let loading = false;
    let allLoaded = false;

    const fetchPostsAndRender = async () => {
      if (loading || allLoaded) return;
      loading = true;

      try {
        const posts = await getPosts(state.category, offset, limit);
        if (posts.length < limit) allLoaded = true;

        for (let post of posts) {
          const postEl = this.createPost(post.uuid, post.content);
          section.appendChild(postEl);
        }

        offset += posts.length;
      } catch (err) {
        console.error('Erreur lors du fetch des posts :', err);
      } finally {
        loading = false;
      }
    };

    const onScroll = () => {
      const scrollBottom = section.scrollHeight - section.scrollTop - section.clientHeight;
      if (scrollBottom < 50) {
        fetchPostsAndRender();
      }
    };
    section.addEventListener('scroll', onScroll);
  }
}
