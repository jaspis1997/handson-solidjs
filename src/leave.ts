export function initLeaveAlert() {
  window.addEventListener("beforeunload", (e: BeforeUnloadEvent) => {
    const message =
      "入力内容が保存されない可能性があります。ページを離れますか？";
    e.preventDefault();
    return message;
  });
}
