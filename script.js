const styles = `
  <style>
    .author-info {
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    }
    .author-info img {
      width: 1.5625rem;
      height: 1.5625rem;
      margin-right: 0.25rem;
      border-radius: 50%;
    }
    .author-name {
      margin-right: 0.25rem;
      color: red;
    }
    .post-info {
      padding: 1rem;
      display: flex;
      align-items: flex-start;
    }
    .post-info .post-image {
      width: 15.625rem;
      margin-right: 1rem;
    }
    .post-info .post-image img {
      width: 100%;
    }
    .post-info .post-title {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .post-info .post-body {
      flex: 1;
    }
    .post-info .post-message {
      margin-bottom: 0;
    }
  </style>
`;
// Define a new custom element called "my-button"
class MyButton extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: 'open' });

    // Define the HTML template for the button
    this.shadowRoot.innerHTML = `
      <style>
        /* Define the button styles */
        button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
        }
      </style>
      <button>
        <slot></slot>
      </button>
    `;
  }
}

// Register the custom element
customElements.define('my-button', MyButton);

// List
class MyList extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: 'open' });

    this.formatPostData = [];
  }

  static get observedAttributes() {
    return ["theme", "is-loading"];
  }

  // Similar to mounted
  connectedCallback() {
    this.injectScript('https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js')
      .then(() => {
        this.initial();

        this.setAttribute("is-loading", true);
      }).catch(error => {
        console.error(error);
    });
  }

  // Watch Attribute changed
  attributeChangedCallback(attrName, oldVal, newVal) {
    this.render();
  }

  // End Life Cycle

  transformPostData(posts, authors) {
    this.formatPostData = posts.map((post) => {
        const author = authors.find((author) => author.id === post.author_id);
        return {
            ...post,
            created_at: dayjs(post.created_at).format('dddd, MMMM DD, YYYY, HH:mm'),
            author,
        }
    });
  };

  async fetchPost() {
    this.setAttribute("is-loading", true);

    const resPost = await fetch('http://maqe.github.io/json/posts.json');
    const postData = await resPost.json();

    const resAuthor = await fetch('http://maqe.github.io/json/authors.json');
    const authorData = await resAuthor.json();

    this.transformPostData(postData, authorData);
    this.setAttribute("is-loading", false);
  }

  injectScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', e => reject(e.error));
        document.head.appendChild(script);
    });
  }

  initial() {
    this.render();
    this.fetchPost();
  }

  render() {
    if (this.getAttribute("is-loading") !== "false") {
      this.shadowRoot.innerHTML = `<div>Loading...</div>`;

      return;
    }

    this.shadowRoot.innerHTML = `
      ${styles}
      <div class="card-item-list ${this.theme}">
        ${
          this.formatPostData.map((post) => {
            return `
            <div class="card-item post-style">
              <div class="mdc-typography--body1 author-info">
                <img src="${post.author?.avatar_url}" alt="${post.author?.name}">
                <span class="author-name">${post.author?.name}</span>
                <span class="post-date">
                    posted on ${post.created_at}
                </span>
            </div>
            <div class="post-info">
                <div class="post-image">
                    <img src="${post.image_url}" alt="${post.title}">
                </div>
                <div class="post-body">
                    <h6 class="mdc-typography--headline6 post-title">${post.title}</h6>
                    <p class="mdc-typography--body1 post-message">${post.body}</p>
                </div>
            </div>
            </diV>
            `
          }).join('')
        }
      </div>
    `;
  }
}

customElements.define('my-list', MyList);