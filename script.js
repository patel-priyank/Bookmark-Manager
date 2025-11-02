const toggleModal = document.querySelector('#toggle-modal');
const bookmarksContainer = document.querySelector('#bookmarks-container');
const modalContainer = document.querySelector('#modal-container');
const closeModal = document.querySelector('#close-modal');
const bookmarkForm = document.querySelector('#bookmark-form');
const websiteNameEl = document.querySelector('#website-name');
const websiteUrlEl = document.querySelector('#website-url');

let bookmarks = {};

const createBookmarks = () => {
  bookmarksContainer.textContent = '';

  if (Object.keys(bookmarks).length === 0) {
    const noBookmarks = document.createElement('span');
    noBookmarks.classList.add('no-bookmarks');
    noBookmarks.textContent = 'No bookmarked websites. Add a bookmark to see it here.';

    bookmarksContainer.append(noBookmarks);

    return;
  }

  Object.keys(bookmarks).forEach(key => {
    const { name, url } = bookmarks[key];

    const bookmarkEl = document.createElement('div');
    bookmarkEl.classList.add('bookmark');

    const bookmarkName = document.createElement('div');
    bookmarkName.classList.add('bookmark-name');

    const favicon = document.createElement('img');
    favicon.setAttribute('src', `https://s2.googleusercontent.com/s2/favicons?domain=${url}`);
    favicon.setAttribute('alt', 'Favicon');

    const anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('target', '_blank');
    anchor.textContent = name;

    const deleteBookmark = document.createElement('i');
    deleteBookmark.classList.add('ph', 'ph-trash', 'delete-bookmark');
    deleteBookmark.setAttribute('title', 'Delete');

    deleteBookmark.addEventListener('click', () => {
      delete bookmarks[url];
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      fetchBookmarks();
    });

    bookmarkName.append(favicon, anchor);
    bookmarkEl.append(bookmarkName, deleteBookmark);
    bookmarksContainer.append(bookmarkEl);
  });
};

const fetchBookmarks = () => {
  const storedBookmarks = localStorage.getItem('bookmarks');

  if (storedBookmarks) {
    bookmarks = JSON.parse(storedBookmarks);
  } else {
    bookmarks = {
      'https://www.google.com/': {
        name: 'Google',
        url: 'https://www.google.com/'
      },
      'https://chatgpt.com/': {
        name: 'ChatGPT',
        url: 'https://chatgpt.com/'
      }
    };

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  createBookmarks();
};

// open modal
toggleModal.addEventListener('click', () => {
  modalContainer.classList.add('show-modal');
  websiteNameEl.focus();
});

// close modal on click of close
closeModal.addEventListener('click', () => {
  modalContainer.classList.remove('show-modal');
});

// close modal on click of overlay
window.addEventListener('click', e => {
  if (e.target === modalContainer) {
    modalContainer.classList.remove('show-modal');
  }
});

// add bookmark
bookmarkForm.addEventListener('submit', e => {
  e.preventDefault();

  let websiteName = websiteNameEl.value.trim();
  let websiteUrl = websiteUrlEl.value.trim();

  // validate values
  if (!websiteName || !websiteUrl) {
    alert('Please provide values for name and URL.');
    return;
  }

  // prepend protocol
  if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
    websiteUrl = 'https://' + websiteUrl;
  }

  const regex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  );

  // validate url
  if (!websiteUrl.match(regex)) {
    alert('Please provide a valid URL.');
    return;
  }

  // remove if url already exists
  if (bookmarks[websiteUrl]) {
    delete bookmarks[websiteUrl];
  }

  // add to list
  bookmarks[websiteUrl] = {
    name: websiteName,
    url: websiteUrl
  };

  // update local storage
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

  // update bookmarks
  fetchBookmarks();

  // reset form
  bookmarkForm.reset();
  websiteNameEl.focus();
});

// update bookmarks on load
fetchBookmarks();
