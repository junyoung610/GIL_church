import { db, auth, storage } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("type") || "notice";
  const postId = urlParams.get("id");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // --- [섹션 1. 목록 페이지 로직] ---
  const postList = document.getElementById("postList");
  if (postList) {
    const boardTitle = document.getElementById("boardTitle");
    if (boardTitle) {
      if (boardType === "bulletin") {
        boardTitle.innerText = "온라인 주보";
        document.title = "온라인 주보 - 길교회"; // 탭 타이틀 변경
      } else if (boardType === "sermon") {
        boardTitle.innerText = "주일설교 목록";
        document.title = "주일설교 - 길교회"; // 탭 타이틀 변경
      } else {
        boardTitle.innerText = "교회 공지사항";
        document.title = "교회소식 - 길교회"; // 탭 타이틀 변경
      }
    }

    if (currentUser && currentUser.role === "admin") {
      const writeBtnArea = document.getElementById("writeBtnArea");
      if (writeBtnArea) {
        writeBtnArea.style.display = "block";
        writeBtnArea.querySelector("a").href = `board_write.html?type=${boardType}`;
      }
    }
    await loadPosts(boardType);
  }

  // --- [섹션 2. 글쓰기/수정 로직] ---
  const writeForm = document.getElementById("writeForm");
  if (writeForm) {
    // 주일설교 게시판일 경우 영상 ID 입력창 노출
    const videoGroup = document.getElementById("sermonVideoGroup");
    if (boardType === "sermon" && videoGroup) {
      videoGroup.style.display = "block";
    }
    setupWritePage(postId, currentUser, boardType);
  }

  // --- [섹션 3. 상세보기 로직] ---
  const viewTitle = document.getElementById("viewTitle");
  if (viewTitle && postId) {
    await loadPostDetail(postId, currentUser);
  }
});

async function loadPosts(type) {
  const q = query(collection(db, "posts"), where("type", "==", type), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  const postList = document.getElementById("postList");
  postList.innerHTML = "";

  let index = querySnapshot.size;
  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index--}</td>
            <td class="title"><a href="board_detail.html?id=${doc.id}">${post.title}${
      post.fileUrl ? " 📎" : ""
    }</a></td>
            <td>${post.author}</td>
            <td>${post.date.split("T")[0]}</td>
            <td>${post.views || 0}</td>
        `;
    postList.appendChild(row);
  });
}

async function setupWritePage(postId, currentUser, boardType) {
  if (!currentUser) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }
  document.getElementById("postAuthor").value = currentUser.name;

  const writeForm = document.getElementById("writeForm");
  writeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const videoId = document.getElementById("postVideoId")
      ? document.getElementById("postVideoId").value
      : null;
    const file = document.getElementById("postFile").files[0];

    let fileUrl = null;
    let fileName = null;

    if (file) {
      const fileRef = ref(storage, `boards/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(snapshot.ref);
      fileName = file.name;
    }

    const postData = {
      title,
      content,
      type: boardType,
      videoId: videoId, // 영상 ID 저장
      author: currentUser.name,
      authorId: currentUser.uid,
      date: new Date().toISOString(),
      views: 0,
      fileUrl,
      fileName,
      fileType: file ? file.type : null,
    };

    await addDoc(collection(db, "posts"), postData);
    alert("등록되었습니다.");
    window.location.href = `board_list.html?type=${boardType}`;
  });
}

async function loadPostDetail(postId, currentUser) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const post = postSnap.data();
  try {
    await updateDoc(postRef, { views: (post.views || 0) + 1 });
  } catch (e) {}

  document.getElementById("viewTitle").innerText = post.title;
  document.getElementById("viewAuthor").innerText = post.author;
  document.getElementById("viewDate").innerText = post.date.split("T")[0];
  document.getElementById("viewViews").innerText = (post.views || 0) + 1;
  document.getElementById("textContent").innerText = post.content.trim();

  // 설교 영상이 있는 경우 본문에 표시
  if (post.videoId) {
    const videoDisplay = document.getElementById("imageDisplay"); // 기존 이미지 영역 활용 혹은 신규 생성
    document.getElementById("imageInsideCard").style.display = "block";
    videoDisplay.innerHTML = `
      <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; max-width:100%;">
        <iframe src="https://www.youtube.com/embed/${post.videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
  } else if (post.fileUrl && post.fileType?.startsWith("image/")) {
    const imgArea = document.getElementById("imageInsideCard");
    imgArea.style.display = "block";
    document.getElementById(
      "imageDisplay"
    ).innerHTML = `<img src="${post.fileUrl}" style="max-width:100%; border-radius:8px;">`;
  }
}
