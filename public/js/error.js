const errorImage = document.getElementById('error-image');
const imageInfo = document.getElementById('image-info');

errorImage?.addEventListener('mouseenter', () => {
  imageInfo?.classList.add('visible');
});

imageInfo?.addEventListener('mouseenter', () => {
  imageInfo?.classList.add('visible');
});

errorImage?.addEventListener('mouseleave', () => {
  imageInfo?.classList.remove('visible');
});

imageInfo?.addEventListener('mouseleave', () => {
  imageInfo?.classList.remove('visible');
});