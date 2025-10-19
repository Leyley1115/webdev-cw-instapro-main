import { renderHeaderComponent } from "./header-component.js";
import { goToPage, user } from "../index.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    // @TODO: Реализовать страницу добавления поста

    let imageUrl = "";
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="form">
        <h3 class="form-title">Добавить пост</h3>
        <div class="form-inputs">
          <div class="upload-image-container">
          </div>
          <label>
            Опишите фотографию:
            <textarea class="input textarea" rows="4"></textarea>
          </label>
          <button class="button" id="add-button">Добавить</button>
        </div>
    </div>
  `;

  console.log('ADD_POSTS_PAGE');

    appEl.innerHTML = appHtml;
    
    renderHeaderComponent({
      user,
      element: document.querySelector('.header-container'),
      goToPage,
    });

    renderUploadImageComponent({
    element: document.querySelector('.upload-image-container'),
    onImageUrlChange: (newUrl) => {
        imageUrl = newUrl;
        console.log("Загружено изображение:", imageUrl);
    }
    })

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.querySelector('.textarea').value;
      onAddPostClick({
        description,
        imageUrl,
      });
    });
  };
  render();
}
