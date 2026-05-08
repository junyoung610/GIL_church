// 임시 교인 데이터 (나중에는 이 부분을 Firebase에서 가져오게 됩니다)
const mockMembers = [
  { name: "김성도", role: "장로", group: "1교구", phone: "010-1234-5678", date: "2015-03-01" },
  { name: "이은혜", role: "권사", group: "2교구", phone: "010-9876-5432", date: "2018-05-15" },
  { name: "박믿음", role: "집사", group: "청년부", phone: "010-1111-2222", date: "2023-11-20" },
  { name: "최소망", role: "성도", group: "새가족", phone: "010-3333-4444", date: "2024-01-05" },
];

// 화면이 모두 로드되면 표에 데이터를 채워넣는 함수
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("memberData");

  // 데이터를 하나씩 꺼내서 HTML 줄(tr)로 만들기
  mockMembers.forEach((member) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.role}</td>
            <td>${member.group}</td>
            <td>${member.phone}</td>
            <td>${member.date}</td>
        `;

    tableBody.appendChild(row);
  });
});
