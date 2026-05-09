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
  // js/board.js 내 postList 체크 부분 수정
  if (postList) {
    const boardTitle = document.getElementById("boardTitle");
    if (boardTitle) {
      if (boardType === "bulletin") boardTitle.innerText = "온라인 주보";
      else if (boardType === "sermon")
        boardTitle.innerText = "주일설교 목록"; // 추가
      else boardTitle.innerText = "교회 공지사항";
    }

    // 관리자에게만 글쓰기 버튼 노출
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
    setupWritePage(postId, currentUser, boardType);
  }

  // --- [섹션 3. 상세보기 로직] ---
  const viewTitle = document.getElementById("viewTitle");
  if (viewTitle && postId) {
    await loadPostDetail(postId, currentUser);
  }
});

// 1. 목록 불러오기
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
            <td class="title"><a href="board_detail.html?id=${doc.id}">${post.title}${post.fileUrl ? " 📎" : ""}</a></td>
            <td>${post.author}</td>
            <td>${post.date.split("T")[0]}</td>
            <td>${post.views || 0}</td>
        `;
    postList.appendChild(row);
  });
}

// 2. 글쓰기 페이지 설정
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
    const file = document.getElementById("postFile").files[0];
    let fileUrl = null;
    let fileName = null;

    // 파일이 있으면 Storage에 업로드
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

// 3. 상세보기 불러오기
// js/board.js 내 loadPostDetail 함수 부분 수정
async function loadPostDetail(postId, currentUser) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const post = postSnap.data();

  // --- 조회수 증가 로직 수정 ---
  try {
    // 권한이 없더라도(비로그인 등) 글 내용은 볼 수 있도록 try-catch로 감쌉니다.
    await updateDoc(postRef, { views: (post.views || 0) + 1 });
  } catch (error) {
    console.log("조회수 업데이트 스킵 (권한 없음)");
  }

  // 데이터 출력 (이제 위에서 에러가 나도 이 부분은 실행됩니다)
  document.getElementById("viewTitle").innerText = post.title;
  document.getElementById("viewAuthor").innerText = post.author;
  document.getElementById("viewDate").innerText = post.date.split("T")[0];
  document.getElementById("viewViews").innerText = (post.views || 0) + 1;

  // 내용 출력 시 데이터가 없는 경우를 대비해 안전하게 처리
  const content = post.content ? post.content.trim() : "";
  document.getElementById("textContent").innerText = content;

  // 이미지 표시 부분도 안전하게 체크 (fileType이 없을 경우 대비)
  if (post.fileUrl && post.fileType && post.fileType.startsWith("image/")) {
    const imgArea = document.getElementById("imageInsideCard");
    imgArea.style.display = "block";
    document.getElementById("imageDisplay").innerHTML =
      `<img src="${post.fileUrl}" style="max-width:100%; border-radius:8px;">`;
  }
  // ... 이하 동일 ...

  // 수정/삭제 버튼 제어
  if (currentUser && (currentUser.uid === post.authorId || currentUser.role === "admin")) {
    const deleteBtn = document.getElementById("deletePostBtn");
    deleteBtn.style.display = "inline-block";
    deleteBtn.onclick = async () => {
      if (confirm("삭제하시겠습니까?")) {
        await deleteDoc(postRef);
        window.location.href = `board_list.html?type=${post.type}`;
      }
    };
  }
}
