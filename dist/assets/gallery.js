const dialog = document.querySelector('#lightbox');
const full = dialog.querySelector('img');
const mainImage = document.querySelector('#main-image');
const mainImageOpen = document.querySelector('#main-image-open');
const mainVideo = document.querySelector('#main-video');
const thumbs = [...document.querySelectorAll('.gallery-thumb')];
let currentFull = thumbs[0].dataset.large;

mainImageOpen.addEventListener('click', () => {
  full.src = currentFull;
  dialog.showModal();
});

thumbs.forEach(thumb => thumb.addEventListener('click', () => {
  thumbs.forEach(item => {
    item.classList.toggle('is-active', item === thumb);
    item.setAttribute('aria-selected', item === thumb ? 'true' : 'false');
  });
  if (thumb.dataset.kind === 'video') {
    mainImageOpen.hidden = true;
    mainVideo.hidden = false;
    if (mainVideo.dataset.poster) mainVideo.poster = mainVideo.dataset.poster;
    mainVideo.play().catch(() => {});
    return;
  }
  mainVideo.pause();
  mainVideo.hidden = true;
  mainImageOpen.hidden = false;
  if (window.RESPONSIVE_IMAGES) window.RESPONSIVE_IMAGES.set(mainImage, thumb.dataset.display, 'display');
  else {
    mainImage.sizes = thumb.dataset.sizes || '';
    mainImage.srcset = thumb.dataset.srcset || '';
    mainImage.src = thumb.dataset.display;
  }
  mainImage.alt = thumb.dataset.alt;
  currentFull = thumb.dataset.large;
}));

dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
