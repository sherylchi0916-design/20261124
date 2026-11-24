let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖

let char2StopSprite; // 儲存角色二的待機精靈圖 (2/stop/stop.png)
let char2ActionSprite; // 儲存角色二的動作精靈圖 (2/action/action.png)

let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景目前的水平捲動偏移量
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色一是否已切換為走路動畫
let facingDirection = 1; // 記錄角色一朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色一是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

// 角色一精靈圖參數
const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度

// 角色二精靈圖參數
const char2StopFrameCount = 8; // 角色二待機精靈圖共 8 張
const char2StopFrameWidth = 707 / char2StopFrameCount; // 全寬 707 除以 8
const char2StopFrameHeight = 190; // 高度 190
const char2ActionFrameCount = 6; // 角色二動作精靈圖共 6 張
const char2ActionFrameWidth = 811 / char2ActionFrameCount; // 全寬 811 除以 6
const char2ActionFrameHeight = 171; // 高度 171

const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 國小國文選擇題資料與作答狀態
const quizData = {
  title: "【國小國文選擇題】",
  question: "下列哪一個成語是用來形容「做事非常專心，不受外界干擾」？",
  options: [
    "(A) 畫蛇添足",
    "(B) 專心致志",
    "(C) 守株待兔",
    "(D) 亡羊補牢"
  ],
  correctIndex: 1 // 正確答案索引：1 代表 (B) 專心致志
};
let selectedOptionIndex = -1; // 記錄玩家點擊的選項索引（-1 代表尚未作答）
let optionButtonBounds = []; // 儲存各選項按鈕的座標範圍供滑鼠點擊偵測
let isQuizVisible = false; // 記錄目前題目方框是否顯示中

function preload() { // 在畫布建立前載入角色與背景圖片
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖

  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二待機精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二互動精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓角色座標代表影格的中心點
  characterX = width / 2; // 將角色一初始位置設在畫布水平中央
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  // 依畫布高度等比例計算單張背景圖的顯示寬度，並串接左、中、右共三張相同大小的背景
  const bgScale = height / bgImage.height;
  const singleBgWidth = bgImage.width * bgScale;
  const maxBgOffset = singleBgWidth; // 向左或向右最多可捲動一張背景圖的距離

  // 設定角色高度為畫布高度的 1/3，並依原始圖片寬高比計算對應縮放比例
  const targetHeight = height / 3;
  const characterScale = targetHeight / frameHeight;
  const characterWidth = frameWidth * characterScale; // 依原圖比例計算角色一顯示寬度
  const characterHeight = targetHeight; // 角色顯示高度為畫布高度的 1/3
  const centerX = width / 2; // 畫布水平中心點

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算移動速度

  if (movingRight) { // 按住右方向鍵時：角色向右走，背景向左捲動
    isWalking = true;
    facingDirection = 1;
    if (characterX < centerX) {
      // 若角色原本在畫面左側（剛從最左邊折返），先讓角色走回畫面中央
      characterX = min(centerX, characterX + movementStep);
    } else if (bgOffsetX > -maxBgOffset) {
      // 角色在中央且背景尚未捲動到最右邊界時，背景往左移動
      bgOffsetX = max(-maxBgOffset, bgOffsetX - movementStep);
    } else {
      // 背景已到達最右邊並暫停捲動，改由角色往右移動
      characterX += movementStep;
    }
  } else if (movingLeft) { // 按住左方向鍵時：角色向左走，背景向右捲動
    isWalking = true;
    facingDirection = -1;
    if (characterX > centerX) {
      // 若角色原本在畫面右側（剛從最右邊折返），先讓角色走回畫面中央
      characterX = max(centerX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      // 角色在中央且背景尚未捲動到最左邊界時，背景往右移動
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      // 背景已到達最左邊並暫停捲動，改由角色往左移動
      characterX -= movementStep;
    }
  }

  // 繪製三張水平串接的背景圖片（左、中、右）
  push();
  imageMode(CORNER);
  const centerBgX = (width - singleBgWidth) / 2 + bgOffsetX; // 中間背景圖的起始 X 座標
  const leftBgX = centerBgX - singleBgWidth; // 最左邊背景圖的起始 X 座標
  image(bgImage, leftBgX, 0, singleBgWidth, height); // 左側串接背景
  image(bgImage, centerBgX, 0, singleBgWidth, height); // 中間主背景
  image(bgImage, centerBgX + singleBgWidth, 0, singleBgWidth, height); // 右側串接背景
  pop();

  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色一中心避免超出畫布左右邊界

  // --- 繪製角色二（位於最左邊背景圖的中間） ---
  const char2X = leftBgX + singleBgWidth / 2; // 角色二跟著最左邊背景圖的中間移動
  const char2Scale = targetHeight / char2StopFrameHeight; // 依高度 1/3 等比例計算角色二縮放倍率
  const char2StopWidth = char2StopFrameWidth * char2Scale; // 計算角色二待機寬度
  const triggerDistance = (characterWidth + char2StopWidth) * 0.9; // 設定角色一接近角色二的觸發距離
  const isNearChar2 = abs(characterX - char2X) < triggerDistance; // 判斷角色一是否接近角色二

  const activeChar2Sprite = isNearChar2 ? char2ActionSprite : char2StopSprite;
  const activeChar2Count = isNearChar2 ? char2ActionFrameCount : char2StopFrameCount;
  const activeChar2FrameW = isNearChar2 ? char2ActionFrameWidth : char2StopFrameWidth;
  const activeChar2FrameH = isNearChar2 ? char2ActionFrameHeight : char2StopFrameHeight;

  const char2FrameIndex = floor(frameCount / framesPerStep) % activeChar2Count; // 循環計算角色二目前影格
  const char2SourceX = char2FrameIndex * activeChar2FrameW;
  const char2DrawW = activeChar2FrameW * char2Scale;
  const char2DrawH = activeChar2FrameH * char2Scale;
  const char2Y = height - char2DrawH / 2; // 將角色二底部對齊畫布底部

  push();
  translate(char2X, char2Y);
  image(activeChar2Sprite, 0, 0, char2DrawW, char2DrawH, char2SourceX, 0, activeChar2FrameW, activeChar2FrameH);
  pop();

  // --- 繪製角色一 ---
  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次
    isCasting = false; // 結束施法動畫並恢復一般角色動作
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效
  } // 結束施法動畫完成判斷

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點
  const activeWidth = activeFrameWidth * characterScale; // 依原圖寬高比計算目前角色影格的顯示寬度
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部

  push(); // 暫存目前的繪圖座標轉換狀態
  translate(characterX, characterY); // 將繪圖原點移至角色中心
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格
  pop(); // 還原繪圖座標轉換狀態

  // --- 繪製魔法特效 ---
  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效
      continue; // 略過已移除特效的繪製
    } // 結束特效邊界判斷
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格
    push(); // 暫存目前的繪圖座標轉換狀態
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格
    pop(); // 還原繪圖座標轉換狀態
  } // 結束飛行中特效更新迴圈

  // --- 當角色1接近角色2時，顯示上方中央的國小國文選擇題方框 ---
  isQuizVisible = isNearChar2;
  if (isNearChar2) {
    drawQuizBox();
  } else {
    selectedOptionIndex = -1; // 離開角色2後重置作答狀態
    optionButtonBounds = [];
    cursor(ARROW);
  }
} // 結束繪圖函式

function drawQuizBox() { // 繪製題目方框與可點擊的國小國文選擇題按鈕
  const boxW = width / 3; // 方框寬度為整個畫布寬度的 1/3
  const boxH = height / 2; // 方框高度為整個畫布高度的 1/2
  const boxX = (width - boxW) / 2; // 方框水平中心對準畫布水平中間
  const boxY = 10; // 方框上方靠近畫布上方

  push();
  rectMode(CORNER);
  fill(255, 235, 59, 220); // 黃色方框
  stroke(230, 180, 0); // 深黃色邊框
  strokeWeight(3);
  rect(boxX, boxY, boxW, boxH, 12);

  const padding = constrain(boxW * 0.06, 12, 24);
  const contentW = boxW - padding * 2;
  const fontSize = constrain(min(boxW * 0.048, boxH * 0.052), 13, 22);

  // 繪製標題與題幹
  noStroke();
  fill(20);
  textAlign(LEFT, TOP);
  textSize(fontSize);
  textLeading(fontSize * 1.35);
  text(quizData.title, boxX + padding, boxY + padding);

  const questionY = boxY + padding + fontSize * 1.7;
  const questionH = fontSize * 3.1;
  text(quizData.question, boxX + padding, questionY, contentW, questionH);

  // 繪製四個可點擊選項按鈕
  optionButtonBounds = [];
  const optionsStartY = questionY + questionH + fontSize * 0.4;
  const feedbackAreaH = fontSize * 1.8;
  const availableOptionsH = boxY + boxH - padding - feedbackAreaH - optionsStartY;
  const btnGap = constrain(availableOptionsH * 0.08, 4, 10);
  const btnH = max(24, (availableOptionsH - btnGap * 3) / 4);
  let hoveringAnyButton = false;

  for (let i = 0; i < quizData.options.length; i++) {
    const btnX = boxX + padding;
    const btnY = optionsStartY + i * (btnH + btnGap);
    const btnW = contentW;

    optionButtonBounds.push({ x: btnX, y: btnY, w: btnW, h: btnH, index: i });

    const isHover = mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH;
    if (isHover) hoveringAnyButton = true;

    // 依作答結果或滑鼠懸停狀態決定按鈕顏色
    if (selectedOptionIndex === i) {
      if (i === quizData.correctIndex) {
        fill(76, 175, 80, 235); // 選對顯示綠色
        stroke(46, 125, 50);
      } else {
        fill(244, 67, 54, 235); // 選錯顯示紅色
        stroke(183, 28, 28);
      }
    } else if (isHover) {
      fill(255, 249, 196, 245); // 滑鼠移過去時高亮提示
      stroke(210, 150, 0);
    } else {
      fill(255, 255, 255, 210); // 未選取時的白底按鈕
      stroke(200, 160, 0);
    }

    strokeWeight(1.5);
    rect(btnX, btnY, btnW, btnH, 8);

    // 按鈕文字
    noStroke();
    fill(selectedOptionIndex === i ? 255 : 20);
    textAlign(LEFT, CENTER);
    textSize(fontSize * 0.92);
    text(quizData.options[i], btnX + 12, btnY + btnH / 2);
  }

  // 滑鼠指標切換為手形提示可點擊
  cursor(hoveringAnyButton ? HAND : ARROW);

  // 顯示作答結果回饋文字
  if (selectedOptionIndex !== -1) {
    const isCorrect = selectedOptionIndex === quizData.correctIndex;
    textAlign(CENTER, BOTTOM);
    textSize(fontSize * 0.95);
    fill(isCorrect ? color(27, 94, 32) : color(183, 28, 28));
    const feedbackMsg = isCorrect ? "⭕ 答對了！真棒！" : "❌ 答錯了，請再點選其他答案試試看！";
    text(feedbackMsg, boxX + boxW / 2, boxY + boxH - padding * 0.6);
  }

  pop();
}

function mousePressed() { // 偵測滑鼠點擊選擇題選項
  if (!isQuizVisible) return;
  for (let i = 0; i < optionButtonBounds.length; i++) {
    const btn = optionButtonBounds[i];
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w && mouseY >= btn.y && mouseY <= btn.y + btn.h) {
      selectedOptionIndex = btn.index;
      break;
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向
  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = 1; // 讓角色面向右方
    return false; // 防止方向鍵捲動網頁
  } // 結束右方向鍵判斷
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = -1; // 讓角色面向左方
    return false; // 防止方向鍵捲動網頁
  } // 結束左方向鍵判斷
  if (keyCode === 32) { // 判斷是否按下空白鍵
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發
      isCasting = true; // 開始播放施法動畫
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面
      magicDirection = facingDirection; // 鎖定施法當下角色面向
    } // 結束施法啟動判斷
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發
    return false; // 防止空白鍵捲動網頁
  } // 結束空白鍵判斷
} // 結束按鍵事件處理函式

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態
  if (keyCode === 32) { // 判斷放開的是否為空白鍵
    spaceIsDown = false; // 允許下次按空白鍵重新施法
  } // 結束空白鍵放開判斷
} // 結束按鍵放開事件處理函式

function windowResized() { // 視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸
  const singleBgWidth = bgImage.width * (height / bgImage.height);
  bgOffsetX = constrain(bgOffsetX, -singleBgWidth, singleBgWidth); // 確保縮放視窗後背景偏移量仍在合法範圍內
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內
} // 結束視窗縮放處理函式