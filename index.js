let timer_interval = undefined;
let timer_now_sec = 0;
const countdown_max_sec = 60 * 8; //競技時間8分
const how_many_CheckPointMarker = 3; // 競技に使用されるチェックポイントマーカーの数
const text_timer = "timer_table_timer"; //htmlTagのid
const text_stopwatch = "timer_table_stopwatch"; //htmlTagのid
const btn_reset = "control_reset";
const btn_stop = "control_stop";
const btn_start = "control_start";
const text_score = "timer_span_score";
const score_by_beginning = 5; //スタートタイルから出発したときにもらえる得点
const score_by_goal = 5; //ゴールしたときにもらえる得点
let is_reached_goal = 0; //ゴールの赤ラインまで到達できたかどうか

const score_elements_list = [
  //競技に出てくる得点要素 [要素名,得点数]
  ["交差点", 10],
  ["シーソー", 15],
  ["障害物", 15],
  ["ギャップ", 10],
  ["十字路", 10],
  ["バンプ", 5],
];

const rescue_score_rate = [
  //[生きている被災者, 死んでいる被災者]
  [1.2, 1.0], //レスキューレベル1
  [1.4, 1.0], //レスキューレベル2
  //[避難Lv1 + キットLv1, 避難Lv1 + キットLv2, 避難Lv2 + キットLv1, 避難Lv2 + キットLv2]
  [1.1, 1.3, 1.2, 1.6], //レスキューキット
];

const tile_score_list = [
  5, //走行1回目における各タイルの得点
  3, //走行2回目における各タイルの得点
  1, //走行3回目における各タイルの得点
  0, //走行3回目以降における各タイルの得点
];

let tile_score_memory_list = [
  /*[進行停止回数, 小計, クリア状況(0=未通過, 1=通過完了)]*/
];

let score_memory_list = [
  /*[要素をクリアした個数, 要素をクリアした個数, 要素をクリアした個数...]*/
];

let rescue_gained_multiple = [];

function To_double_digest_number(number) {
  //一桁の数字に対して頭に0をつける（例：3 => 03）
  return ("0" + number).slice(-2);
}

function To_MinSec(sec) {
  //int型で与えられた秒数をstring型の00:00形式で返す
  return (
    To_double_digest_number(Math.floor(((sec % (24 * 60 * 60)) % (60 * 60)) / 60)) +
    ":" +
    To_double_digest_number(((sec % (24 * 60 * 60)) % (60 * 60)) % 60)
  );
}

window.addEventListener("beforeunload", (e) => {
  //リロード時に警告をする
  //e.preventDefault();
  //e.returnValue = "";
});

window.onload = function () {
  //得点板とタイマーの表示を初期設定する
  document.getElementById(text_timer).innerText = To_MinSec(countdown_max_sec);
  document.getElementById(text_stopwatch).innerText = To_MinSec(timer_now_sec);
  document.getElementById(btn_stop).style.display = "none";
  document.getElementById(btn_start).style.display = "flex";

  //「得点要素」の要素テーブルを生成する
  for (let index = 0; index < score_elements_list.length; index++) {
    let tempHTML =
      "<tr>" +
      "<td>" +
      score_elements_list[index][0] +
      '<span class="score-points">(' +
      score_elements_list[index][1] +
      "点)</span>" +
      "</td>" +
      "<td>" +
      '<span class="count_elements fade-orange">0</span>' +
      '<span class="add_elements" onclick="elements_add(' +
      index +
      ')">+</span>' +
      '<span class="reduce_elements" onclick="elements_reduce(' +
      index +
      ')">-</span>' +
      "</td>" +
      "</tr>";
    document.getElementById("score_table_tbody").innerHTML += tempHTML;
    score_memory_list.push(0);
  }

  //「タイル走行」の入力テーブルを生成する
  var tempHTML =
    "<tbody>" +
    '<tr><td class="tile_table_title_td clear" colspan=5 onclick="checkpoint_done(0);">スタート(5点)</td></tr>';
  for (let index = 0; index <= how_many_CheckPointMarker; index++) {
    tempHTML +=
      '<tr class="title_scoreboard no_clear ' +
      index +
      '">' +
      "<td colspan=3>進行の停止：" +
      '<span class="tile_count_elements fade-orange">0</span>回</td>' +
      "<td colspan=2>" +
      '<span class="add_elements" onclick="tile_add(' +
      index +
      ')">+</span>' +
      '<span class="reduce_elements" onclick="tile_reduce(' +
      index +
      ')">-</span>' +
      "</td>" +
      "</tr>";

    tempHTML +=
      '<tr class="title_scoreboard no_clear ' +
      index +
      '">' +
      "<td class=tile_each_point>" +
      tile_score_list[0] +
      "点</td>" +
      "<td>☓</td>" +
      "<td><input class=input_tile_count type=number value=10>枚</input></td>" +
      "<td>＝</td>" +
      "<td class=tile_score_sum>小計</td>" +
      "</tr>";

    tempHTML +=
      '<tr><td class="tile_table_title_td checkpoint no_clear" colspan=5 onclick="checkpoint_done(' +
      index +
      ');">' +
      "チェックポイント(未通過)" +
      "</td></tr>";
    tile_score_memory_list.push([0, 0, 0]);
  }
  tempHTML +=
    '<tr><td class="tile_table_title_td goal no_clear" colspan=5 onclick="checkpoint_done(' +
    (how_many_CheckPointMarker + 1) +
    ');">ゴール(' +
    score_by_goal +
    "点)</td></tr>";
  tempHTML += "</tbody>";
  document.getElementById("score_tiles").innerHTML += tempHTML;
};

//タイマー関連のファンクション
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

//得点管理関連のファンクション
function re_append(element) {
  const temp = element.parentNode.innerHTML;
  element.parentNode.innerHTML = '<div id="re_append_temp"></div>';
  document.getElementById("re_append_temp").parentNode.innerHTML = temp;
}

function update_score_display() {
  temp = 0;
  temp += score_by_beginning; //スタート時に与えられる点数
  //得点要素によって獲得した点数
  for (let index = 0; index < score_elements_list.length; index++) {
    temp += score_elements_list[index][1] * score_memory_list[index];
  }
  //タイル走行によって獲得した点数
  for (let index = 0; index < tile_score_memory_list.length; index++) {
    temp += tile_score_memory_list[index][1] * tile_score_memory_list[index][2];
  }
  //ゴールしたことによる得点
  temp += is_reached_goal * score_by_goal;
  //レスキューによって獲得した乗数を適応する
  const evacuate_zone = document.getElementById("select_rescue_level").value;
  const rescue_kit = document.getElementById("rescue_kit").value;
  const temp_rescue_kit = evacuate_zone + "_" + rescue_kit;
  if (temp_rescue_kit == "1_1") temp *= rescue_score_rate[2][0];
  if (temp_rescue_kit == "1_2") temp *= rescue_score_rate[2][1];
  if (temp_rescue_kit == "2_1") temp *= rescue_score_rate[2][2];
  if (temp_rescue_kit == "2_2") temp *= rescue_score_rate[2][3];
  for (let index = 0; index < rescue_gained_multiple.length; index++) {
    temp *= rescue_gained_multiple[index];
  }
  //点数を表示
  document.getElementById("timer_span_score").innerHTML = parseInt(temp).toLocaleString();
  re_append(document.getElementById("timer_span_score"));
}

function elements_add(num) {
  //得点要素に対する追加
  score_memory_list[num]++;
  document.getElementsByClassName("count_elements")[num].innerText = score_memory_list[num];
  re_append(document.getElementsByClassName("count_elements")[num]);
  update_score_display();
}

function elements_reduce(num) {
  //得点要素に対する減少
  if (score_memory_list[num] > 0) {
    score_memory_list[num]--;
    document.getElementsByClassName("count_elements")[num].innerText = score_memory_list[num];
    re_append(document.getElementsByClassName("count_elements")[num]);
    update_score_display();
  }
}

function tile_score_calc(num) {
  const tile_count = document.getElementsByClassName("input_tile_count")[num].value;
  let each_tile_score = tile_score_list[0];
  if (tile_score_memory_list[num][0] == 0) each_tile_score = tile_score_list[0];
  if (tile_score_memory_list[num][0] == 1) each_tile_score = tile_score_list[1];
  if (tile_score_memory_list[num][0] == 2) each_tile_score = tile_score_list[2];
  if (tile_score_memory_list[num][0] >= 3) each_tile_score = tile_score_list[3];
  tile_score_memory_list[num][1] = tile_count * each_tile_score;
  document.getElementsByClassName("tile_score_sum")[num].innerText = tile_score_memory_list[num][1] + "点";
  document.getElementsByClassName("tile_each_point")[num].innerText = each_tile_score + "点";
  update_score_display();
}

function tile_add(num) {
  //競技進行の停止回数を追加
  tile_score_memory_list[num][0]++;
  document.getElementsByClassName("tile_count_elements")[num].innerText = tile_score_memory_list[num][0];
  tile_score_calc(num);
}

function tile_reduce(num) {
  //競技進行の停止回数を減少
  if (tile_score_memory_list[num][0] > 0) {
    tile_score_memory_list[num][0]--;
    document.getElementsByClassName("tile_count_elements")[num].innerText = tile_score_memory_list[num][0];
    tile_score_calc(num);
  }
}

function checkpoint_done(num) {
  const title_element = document.getElementsByClassName("tile_table_title_td")[num + 1];
  if (title_element.classList.contains("checkpoint")) {
    title_element.innerText = "チェックポイント(クリア)";
    document.getElementsByClassName("title_scoreboard")[num * 2].classList.remove("no_clear");
    document.getElementsByClassName("title_scoreboard")[num * 2].classList.add("clear");
    document.getElementsByClassName("title_scoreboard")[num * 2 + 1].classList.remove("no_clear");
    document.getElementsByClassName("title_scoreboard")[num * 2 + 1].classList.add("clear");
    tile_score_memory_list[num][2] = 1;
  }
  if (title_element.classList.contains("goal")) {
    is_reached_goal = 1;
  }
  title_element.classList.remove("no_clear");
  title_element.classList.add("clear");
  tile_score_calc(num);
  update_score_display();
}

function added_rescue() {
  const selectList = document.getElementsByClassName("selector_rescue");
  if (selectList[selectList.length - 1].value != "none") {
    let new_tr = document.createElement("tr");
    new_tr.classList.add("rescue_latest_tr");
    new_tr.innerHTML =
      '<tr class="rescue_latest_tr">' +
      "  <td>" +
      (selectList.length + 1) +
      "番目</td>" +
      "  <td>" +
      '    <select id="selector_rescue" class="selector_rescue" onchange="added_rescue()">' +
      '      <option value="none">なし</option>' +
      '      <option value="alive">生きている被災者</option>' +
      '      <option value="dead">死んでいる被災者</option>' +
      "    </select>" +
      "  </td>" +
      "  <td class=rescue_rate_td>x0</td>" +
      "</tr>";
    document.getElementsByClassName("rescue_latest_tr")[0].after(new_tr);
    document.getElementsByClassName("rescue_latest_tr")[0].classList.remove("rescue_latest_tr");
  }
  let rescue_results = [];
  for (let index = 0; index < selectList.length; index++) {
    rescue_results.push(selectList[index].value);
  }
  const rescue_level = parseInt(document.getElementById("select_rescue_level").value) - 1;
  let is_livings_done = 0;
  rescue_gained_multiple = [];
  for (let index = rescue_results.length - 1; index >= 0; index--) {
    if (rescue_results[index] == "alive") {
      document.getElementsByClassName("rescue_rate_td")[index].innerText = "x" + rescue_score_rate[rescue_level][0];
      rescue_gained_multiple.push(rescue_score_rate[rescue_level][0]);
      is_livings_done = 1;
    }
    if (rescue_results[index] == "dead") {
      document.getElementsByClassName("rescue_rate_td")[index].innerText =
        "x" + rescue_score_rate[rescue_level][is_livings_done];
      rescue_gained_multiple.push(rescue_score_rate[rescue_level][is_livings_done]);
    }
  }
  update_score_display();
}
