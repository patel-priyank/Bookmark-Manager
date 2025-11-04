const toggleModal = document.querySelector('#toggle-modal');
const selectContainer = document.querySelector('#select-container');
const nativeSelect = selectContainer.querySelector('select');
const bookmarksContainer = document.querySelector('#bookmarks-container');
const modalContainer = document.querySelector('#modal-container');
const closeModal = document.querySelector('#close-modal');
const bookmarkForm = document.querySelector('#bookmark-form');
const websiteNameEl = document.querySelector('#website-name');
const websiteUrlEl = document.querySelector('#website-url');

let bookmarks = {};

const createBookmarks = () => {
  bookmarksContainer.textContent = '';

  if (Object.values(bookmarks).length === 0) {
    const noBookmarks = document.createElement('span');
    noBookmarks.classList.add('no-bookmarks');
    noBookmarks.textContent = 'No bookmarked websites. Add a bookmark to see it here.';

    bookmarksContainer.append(noBookmarks);

    return;
  }

  let sortedBookmarks = [];

  switch (nativeSelect.value) {
    case 'name-ascending':
      sortedBookmarks = Object.values(bookmarks).sort((a, b) => a.name.localeCompare(b.name));
      break;

    case 'name-descending':
      sortedBookmarks = Object.values(bookmarks).sort((a, b) => b.name.localeCompare(a.name));
      break;

    case 'created-ascending':
      sortedBookmarks = Object.values(bookmarks).sort((a, b) =>
        a.created === b.created ? a.name.localeCompare(b.name) : a.created - b.created
      );
      break;

    case 'created-descending':
      sortedBookmarks = Object.values(bookmarks).sort((a, b) =>
        a.created === b.created ? a.name.localeCompare(b.name) : b.created - a.created
      );
      break;
  }

  sortedBookmarks.forEach(bookmark => {
    const { name, url, created } = bookmarks[bookmark.url];

    const bookmarkEl = document.createElement('div');
    bookmarkEl.classList.add('bookmark');

    const bookmarkContent = document.createElement('div');
    bookmarkContent.classList.add('bookmark-content');

    const bookmarkName = document.createElement('div');
    bookmarkName.classList.add('bookmark-name');

    const favicon = document.createElement('img');
    favicon.setAttribute('src', `https://s2.googleusercontent.com/s2/favicons?domain=${url}`);
    favicon.setAttribute('alt', 'Favicon');

    const anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('title', name);
    anchor.textContent = name;

    const deleteBookmark = document.createElement('i');
    deleteBookmark.classList.add('ph', 'ph-trash', 'delete-bookmark');
    deleteBookmark.setAttribute('title', 'Delete');

    deleteBookmark.addEventListener('click', () => {
      if (selectContainer.querySelector('.select').classList.contains('active')) {
        return;
      }

      delete bookmarks[url];
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      fetchBookmarks();
    });

    const bookmarkTime = document.createElement('div');
    bookmarkTime.classList.add('bookmark-time');
    bookmarkTime.textContent = new Date(created).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    bookmarkName.append(favicon, anchor);
    bookmarkContent.append(bookmarkName, deleteBookmark);
    bookmarkEl.append(bookmarkContent, bookmarkTime);
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
        url: 'https://www.google.com/',
        created: Number(new Date())
      },
      'https://chatgpt.com/': {
        name: 'ChatGPT',
        url: 'https://chatgpt.com/',
        created: Number(new Date())
      }
    };

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  createBookmarks();
};

const createCustomDropdown = () => {
  // create selected display element
  const selectDiv = document.createElement('div');
  selectDiv.classList.add('select');
  selectDiv.textContent = nativeSelect.selectedOptions[0].textContent;
  selectContainer.append(selectDiv);

  // create dropdown list
  const dropdown = document.createElement('div');
  dropdown.classList.add('options');

  // add items to dropdown list
  for (const option of nativeSelect.options) {
    const optionDiv = document.createElement('div');
    optionDiv.textContent = option.textContent;
    optionDiv.setAttribute('value', option.value);

    optionDiv.addEventListener('click', () => {
      // change value for native select and change text for display element
      nativeSelect.value = optionDiv.getAttribute('value');
      selectDiv.textContent = optionDiv.textContent;

      // deselect all selected
      const selectedItems = dropdown.querySelectorAll('.selected');
      selectedItems.forEach(item => item.classList.remove('selected'));

      // select clicked option and close dropdown
      optionDiv.classList.add('selected');
      selectDiv.classList.remove('active');

      createBookmarks();
    });

    // append to dropdown list
    dropdown.append(optionDiv);
  }

  // append dropdown list to select container
  selectContainer.append(dropdown);

  selectDiv.addEventListener('click', () => {
    selectDiv.classList.toggle('active');
  });
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

// close select dropdown on click of window
window.addEventListener('click', e => {
  e.preventDefault();

  if (!selectContainer.contains(e.target)) {
    selectContainer.querySelector('.select').classList.remove('active');
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
    url: websiteUrl,
    created: Number(new Date())
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

// create custom dropdown on load
createCustomDropdown();
