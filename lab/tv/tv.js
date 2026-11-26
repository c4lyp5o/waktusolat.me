// Fit the fixed 1920x1080 (or portrait) stage to whatever screen opens it.
const st = document.querySelector(".stage");
const W = +st.dataset.w || 1920, H = +st.dataset.h || 1080;
st.style.width = `${W}px`;
st.style.height = `${H}px`;
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  st.style.transform = `scale(${s})`;
  st.style.left = `${(innerWidth - W * s) / 2}px`;
  st.style.top = `${(innerHeight - H * s) / 2}px`;
}
addEventListener("resize", fit);
fit();
