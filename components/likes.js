import { postsHost } from "../api.js";
import { getToken } from "../index.js";

export function like(postId){
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: getToken(),
    }
  })
  .then(response => response.json())
  .then(data => data.post);
}

export function dislike(postId){
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: getToken(),
    }
  })
  .then(response => response.json())
  .then(data => data.post);
}
