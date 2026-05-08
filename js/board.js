document.addEventListener("DOMContentLoaded", () => {
  // 1. 공통 데이터 초기화
  const urlParams = new URLSearchParams(window.location.search);
  const boardType = urlParams.get("type") || "notice";
  const postId = urlParams.get("id");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let allPosts = JSON.parse(localStorage.getItem("churchPosts")) || [];

  // --- [섹션 1. 목록 페이지 로직 (board_list.html)] ---
  const postList = document.getElementById("postList");
  if (postList) {
    const boardTitle = document.getElementById("boardTitle");
    if (boardTitle) {
      boardTitle.innerText = boardType === "bulletin" ? "온라인 주보" : "교회 공지사항";
    }

    const writeBtnArea = document.getElementById("writeBtnArea");
    if (currentUser && currentUser.role === "admin") {
      if (writeBtnArea) {
        writeBtnArea.style.display = "block";
        const writeLink = writeBtnArea.querySelector("a");
        if (writeLink) writeLink.href = `board_write.html?type=${boardType}`;
      }
    }
    renderPostList(boardType, allPosts);
  }

  // --- [섹션 2. 글쓰기 및 수정 페이지 로직 (board_write.html)] ---
  const writeForm = document.getElementById("writeForm");
  const fileInput = document.getElementById("postFile");
  let attachedFileData = null;

  if (writeForm) {
    let isEditMode = false;
    let targetPostIndex = -1;

    // 파일 선택 시 Base64 변환 및 미리보기
    if (fileInput) {
      fileInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
          attachedFileData = { name: file.name, type: file.type, data: event.target.result };
          const previewArea = document.getElementById("filePreview");
          const previewImg = document.getElementById("previewImg");
          if (file.type.startsWith("image/") && previewArea && previewImg) {
            previewArea.style.display = "block";
            previewImg.src = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // 수정 모드 확인
    if (postId) {
      targetPostIndex = allPosts.findIndex((p) => p.id == postId);
      if (targetPostIndex !== -1) {
        isEditMode = true;
        const post = allPosts[targetPostIndex];
        document.getElementById("writePageTitle").innerText = "게시글 수정";
        document.getElementById("postTitle").value = post.title;
        document.getElementById("postContent").value = post.content;
        document.getElementById("postAuthor").value = post.author;
        document.querySelector(".btn-submit").innerText = "수정 완료";
        if (post.attachment) attachedFileData = post.attachment;
      }
    } else {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
      }
      document.getElementById("postAuthor").value = currentUser.name;
    }

    // 저장 버튼 클릭 시
    writeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("postTitle").value;
      const content = document.getElementById("postContent").value;

      if (isEditMode) {
        allPosts[targetPostIndex].title = title;
        allPosts[targetPostIndex].content = content;
        allPosts[targetPostIndex].attachment = attachedFileData;
        alert("수정되었습니다.");
      } else {
        allPosts.push({
          id: Date.now(),
          type: boardType,
          title: title,
          content: content,
          author: currentUser.name,
          authorId: currentUser.id,
          attachment: attachedFileData,
          date: new Date().toISOString(),
          views: 0,
        });
        alert("등록되었습니다.");
      }
      localStorage.setItem("churchPosts", JSON.stringify(allPosts));
      window.location.href = isEditMode
        ? `board_detail.html?id=${postId}`
        : `board_list.html?type=${boardType}`;
    });
  }

  // --- [섹션 3. 상세보기 페이지 로직 (board_detail.html)] ---
  const viewTitle = document.getElementById("viewTitle");
  if (viewTitle) {
    const postIndex = allPosts.findIndex((p) => p.id == postId);
    const post = allPosts[postIndex];

    if (!post) {
      alert("게시글을 찾을 수 없습니다.");
      window.location.href = "board_list.html";
      return;
    }

    // 조회수 증가 처리
    post.views = (post.views || 0) + 1;
    allPosts[postIndex] = post;
    localStorage.setItem("churchPosts", JSON.stringify(allPosts));

    // 텍스트 정보 출력
    viewTitle.innerText = post.title;
    document.getElementById("viewAuthor").innerText = post.author;
    document.getElementById("viewDate").innerText = post.date.split("T")[0];
    document.getElementById("viewViews").innerText = post.views;

    // 1. 글 내용은 'textContent' 영역에 trim() 적용하여 출력
    const textArea = document.getElementById("textContent");
    if (textArea) {
      textArea.innerText = post.content.trim();
    }

    // 2. 첨부파일 표시 로직
    if (post.attachment) {
      // 이미지일 경우 상단 이미지 박스에 출력
      if (post.attachment.type.startsWith("image/")) {
        const imgArea = document.getElementById("imageInsideCard");
        const imgDisplay = document.getElementById("imageDisplay");
        if (imgArea && imgDisplay) {
          imgArea.style.display = "block";
          imgDisplay.innerHTML = `
                        <img src="${post.attachment.data}" 
                             style="max-width:100%; border-radius:8px; display:block; margin: 0 auto;">
                    `;
        }
      }

      // 일반 파일(혹은 이미지 다운로드용)은 하단 카드에 출력
      const downArea = document.getElementById("downloadArea");
      const downCard = document.getElementById("fileDownloadCard");
      if (downArea && downCard) {
        downArea.style.display = "block";
        downCard.innerHTML = `
                    <p style="margin:0; font-weight:bold; color:#1a1a2e; font-size:0.95rem;">첨 be파일 다운로드</p>
                    <a href="${post.attachment.data}" download="${post.attachment.name}" style="color:#1e40af; text-decoration:underline; font-size:0.85rem;">
                        ${post.attachment.name}
                    </a>
                `;
      }
    }

    // 수정/삭제 권한 확인 버튼 노출
    if (currentUser && (currentUser.id === post.authorId || currentUser.role === "admin")) {
      const editBtn = document.getElementById("editPostBtn");
      const deleteBtn = document.getElementById("deletePostBtn");
      if (editBtn) {
        editBtn.style.display = "inline-block";
        editBtn.onclick = () => (window.location.href = `board_write.html?id=${postId}`);
      }
      if (deleteBtn) {
        deleteBtn.style.display = "inline-block";
        deleteBtn.onclick = () => {
          if (confirm("정말 삭제하시겠습니까?")) {
            allPosts.splice(postIndex, 1);
            localStorage.setItem("churchPosts", JSON.stringify(allPosts));
            window.location.href = `board_list.html?type=${post.type}`;
          }
        };
      }
    }
  }
});

// --- [공용 함수: 게시글 목록 출력] ---
function renderPostList(type, allPosts) {
  const postList = document.getElementById("postList");
  if (!postList) return;

  const filtered = allPosts
    .filter((p) => p.type === type)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  postList.innerHTML =
    filtered.length === 0
      ? `<tr><td colspan="5" style="padding: 50px; color: #94a3b8; text-align:center;">등록된 게시물이 없습니다.</td></tr>`
      : "";

  filtered.forEach((post, index) => {
    const row = document.createElement("tr");
    const fileIcon = post.attachment ? " 📎" : "";
    row.innerHTML = `
            <td>${filtered.length - index}</td>
            <td class="title">
                <a href="board_detail.html?id=${post.id}">${post.title}${fileIcon}</a>
            </td>
            <td>${post.author}</td>
            <td>${post.date.split("T")[0]}</td>
            <td>${post.views || 0}</td>
        `;
    postList.appendChild(row);
  });
}
