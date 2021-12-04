let timer_interval = undefined;
let timer_now_sec = 0;
const countdown_max_sec = 60 * 8; //競技時間8分
const text_timer = "timer_table_timer"; //htmlTagのid
const text_stopwatch = "timer_table_stopwatch"; //htmlTagのid
const btn_reset = "control_reset";
const btn_stop = "control_stop";
const btn_start = "control_start";
const text_score = "timer_span_score";

function To_double_digest_number(number) {
  return ("0" + number).slice(-2);
}

function To_MinSec(sec) {
  return (
    To_double_digest_number(
      Math.floor(((sec % (24 * 60 * 60)) % (60 * 60)) / 60)
    ) +
    ":" +
    To_double_digest_number(((sec % (24 * 60 * 60)) % (60 * 60)) % 60)
  );
}

window.onload = function () {
  document.getElementById(text_timer).innerText = To_MinSec(countdown_max_sec);
  document.getElementById(text_stopwatch).innerText = To_MinSec(timer_now_sec);
  document.getElementById(btn_stop).style.display = "none";
  document.getElementById(btn_start).style.display = "flex";
};

function Update_timer_display() {
  if (timer_now_sec == countdown_max_sec) {
    window.alert("競技が終了しました。");
  }

  stopwatch_text = To_MinSec(timer_now_sec);
  document.getElementById(text_stopwatch).innerText = stopwatch_text;

  if (timer_now_sec < countdown_max_sec) {
    countdown_text = To_MinSec(countdown_max_sec - timer_now_sec);
    document.getElementById(text_timer).innerText = countdown_text;
  }
}

function addTimer() {
  timer_now_sec++;
  Update_timer_display();
}

function timer_begin() {
  timer_interval = setInterval(addTimer, 1000);
  document.getElementById(btn_start).style.display = "none";
  document.getElementById(btn_stop).style.display = "flex";
}

function timer_reset() {
  clearInterval(timer_interval);
  timer_now_sec = 0;
  Update_timer_display();
  document.getElementById(btn_start).style.display = "flex";
  document.getElementById(btn_stop).style.display = "none";
}

function timer_freeze() {
  clearInterval(timer_interval);
  document.getElementById(btn_start).style.display = "flex";
  document.getElementById(btn_stop).style.display = "none";
}