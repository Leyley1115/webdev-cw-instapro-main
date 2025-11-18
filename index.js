import { getPosts, postsHost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent} from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { renderHeaderComponent } from "./components/header-component.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken()})
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

if (newPage === USER_POSTS_PAGE) {
 console.log("Открываю страницу пользователя: ", data.userId); 
 page = USER_POSTS_PAGE; 
 posts = []; 
 return getPosts({ 
  token: getToken(), 
  host: `${postsHost}/user-posts/${data.userId}`
  })
  .then((result) =>{
    posts = result; 
    return posts; 
  })
  .then(() =>{ 
    if (posts.length === 0){ 
      element.insertAdjacentHTML("beforeend", `<p>У пользователя пока нет постов.</p>`); 
    return;
    }
    console.log(posts); 
    const appEl = document.getElementById("app"); 
    renderPostsPageComponent({ 
      appEl, 
    });
  })
  .then(() =>{
    const button = document.querySelectorAll(".post-likes");
    button.forEach(el => {
      el.insertAdjacentHTML("afterend", `<button class = "delButton">Удалить пост</button>`);
    })
    
    document.querySelectorAll(".delButton").forEach(del => {
    del.addEventListener("click", () => {
      const postId = document.querySelector(".like-button");
      const id = postId.dataset.postId;

      fetch(`${postsHost}/${id}`, {
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
  });
}


    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

export const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    console.log('Loading page');
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    console.log('Auth page');
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    console.log('add posts page');
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // @TODO: реализовать добавление поста в API
        return fetch(postsHost, {
          method: "POST",
          headers: {
            Authorization: getToken(),
          },
          body: JSON.stringify({
            description,
            imageUrl,
          }),
        })
        .then(() =>{
          console.log("Добавляю пост...", { description, imageUrl });
          return goToPage(POSTS_PAGE);
        })
      },
    });
  }

  if (page === POSTS_PAGE) {
    console.log('posts page');
  //     getPosts({ token: getToken() })
  // .then(allPosts => {
  //   console.log('Страница пользователя');
  //   posts = allPosts.filter(post => post.user.id === data.userId);
  //   page = USER_POSTS_PAGE;
  //   renderApp();
  // });
  document.querySelector('.userPosts')?.remove();
    renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    // @TODO: реализовать страницу с фотографиями отдельного пользвателя
    renderHeaderComponent({
      user,
      element: document.getElementById('app'),
      goToPage,
    })
    // renderPostsPageComponent({
    //   appEl,
    // });

    // appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    return;
  }
};

goToPage(POSTS_PAGE);
