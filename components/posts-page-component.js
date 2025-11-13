import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, renderApp } from "../index.js";
import { postsHost, getPosts } from "../api.js";
import { like, dislike } from "./likes.js";



export function renderPostsPageComponent({ appEl }) {
  // @TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);
  /**
   * @TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
 if (posts.length !== 0) {
  const appHtml = posts.map(post => `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="./assets/images/like-active.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.description}</span>
          </p>
          <p class="post-date">
            ${new Date(post.createdAt).toLocaleString()}
          </p>
        </li>
      </ul>
    </div>
  `).join("");

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  document.querySelectorAll(".post-header").forEach(userEl => {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  });

  document.querySelectorAll(".like-button").forEach(button => {
  button.addEventListener("click", () => {
    const postId = button.dataset.postId;

    getPosts({ token: getToken() }).then((res) => {
      const post = res.find(post => String(post.id) === postId);

      const likesTextEl = button.closest(".post").querySelector(".post-likes-text strong");

      const update = (updatedPost) => {
        likesTextEl.textContent = updatedPost.likes.length;
      };

      if (post.isLiked === false) {
        console.log("лайк не нажат");
        like(postId).then(response => update(response));
      } else {
        console.log("лайк нажат");
        dislike(postId).then(response => update(response));
      }
    });
  });
});
} else {
  document.querySelector('.loading-page').innerHTML = `Посты ещё не добавлены`;
}

}

export function renderUserPage(user_id) {
  let element = document.getElementById('app');
  renderApp();
  element.insertAdjacentHTML("afterend", `<div class="userPosts"></div>`);
  const postsEl = document.querySelector('.userPosts');

  return fetch(`${postsHost}/user-posts/${user_id}`, {
    method: "GET",
    headers: {
      Authorization: getToken(),
    }
  })
    .then((result) => result.json())
    .then((posts) => {
      if (posts.posts.length === 0) {
        element.insertAdjacentHTML("beforeend", `<p>У пользователя пока нет постов.</p>`);
        return;
      }
      let data = posts;
      // const startHtml = data.posts.map(post =>`<p>Страница пользователя ${post.user.name}</p>`).join("")
      const appHtml = data.posts.map(post => `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="./assets/images/like-active.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
            <button class="delButton" data-post-id="${post.id}">Удалить пост</button>
          </div>
          <p class="post-text">
            <span class="user-name">${post.description}</span>
          </p>
          <p class="post-date">
            ${new Date(post.createdAt).toLocaleString()}
          </p>
        </li>
      `).join("");
      // document.querySelector('.page-header').insertAdjacentHTML("afterend", startHtml);
      postsEl.insertAdjacentHTML("beforeend", appHtml);

    ///удаление постов
    document.querySelectorAll(".delButton").forEach(del => {
    del.addEventListener("click", () => {
      const postId = del.dataset.postId;

      fetch(`${postsHost}/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: getToken(),
        },
      })
      .then(() => {
        del.closest(".post").remove();
      })
      .catch((error) => {
        console.error("Ошибка при удалении:", error);
      });
      });
    });
    })
    .catch((error) => {
      console.error("Ошибка при загрузке постов пользователя:", error);
    });
}
